import { useEffect, useState, useRef, use } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Send,
  Users,
  Circle,
  ArrowLeft,
  MoreVertical,
  Image as ImageIcon,
  BarChart3,
} from "lucide-react";
import {
  Get_All_Collaborators,
  Send_Chat_Message,
  Get_Chat_Messages,
} from "../api/auth";
import { useParams, useNavigate } from "react-router-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useSelector } from "react-redux";
import PollCreator from "../components/PollCreator";
import PollMessage from "../components/PollMessage";
import { Create_Poll_Message, Cast_Vote } from "../api/auth";

const Chat = () => {
  const {
    activeUsers,
    messageQueue,
    setMessageQueue,
    newPollMessage,
    setNewPollMessage,
    votesCast,
    setVotesCast,
  } = useWebSocket();
  const currentUser = useSelector((state) => state.profile);
  const [collaborators, setCollaborators] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const messagesEndRef = useRef(null);
  const { id } = useParams();
  const itineraries = useSelector((state) => state.itinerary.itineraries);
  const currentItinerary = itineraries.find(
    (itinerary) => itinerary.id === parseInt(id)
  );
  const navigate = useNavigate();

useEffect(() => {
  if (votesCast) {
    console.log("=== useEffect triggered for votesCast ===");
    console.log("Votes cast updated:", votesCast);
    console.log("Current messages before vote update:", messages);
    const { poll_id, poll_option_id, user_id } = votesCast;
    console.log(`Vote details: poll_id=${poll_id}, option_id=${poll_option_id}, user_id=${user_id}, currentUser.id=${currentUser?.id}`);
    
    if (user_id !== currentUser?.id) {
      console.log("Updating messages with new vote...");
      setMessages((prevMessages) => {
        console.log("prevMessages length:", prevMessages.length);
        const updated = prevMessages.map((msg, index) => {
          console.log(`Msg ${index}: type=${msg.message_type}, poll_id=${msg.poll_id || 'undefined'}, target_poll_id=${poll_id}`);
          if (msg.message_type === "poll" && msg.poll_id === poll_id) {
            console.log(`Found matching poll message: id=${msg.id}`);
            const updatedOptions = msg.poll.options.map((opt, optIndex) => {
              console.log(`Option ${optIndex}: id=${opt.id}, target_option_id=${poll_option_id}, current vote_count=${opt.vote_count}, votes length=${opt.votes?.length || 0}`);
              if (opt.id === poll_option_id) {
                const newVotes = [...(opt.votes || []), user_id];
                const newCount = (opt.vote_count || 0) + 1;
                console.log(`Updating option ${optIndex}: new votes length=${newVotes.length}, new count=${newCount}`);
                return {
                  ...opt,
                  votes: newVotes,
                  vote_count: newCount,
                };
              }
              return opt;
            });
            console.log("Updated options:", updatedOptions);
            return {
              ...msg,
              poll: {
                ...msg.poll,
                options: updatedOptions,
              },
            };
          }
          return msg;
        });
        console.log("Final updated messages in callback:", updated);
        return updated;
      });
      // Note: Logging messages here will show the previous state due to async setState.
      // To verify, add a separate useEffect logging on messages change.
      console.log("Messages after vote update (async - may show old state):", messages);
      setVotesCast(null);
    } else {
      console.log("Vote cast by current user; no update needed.");
    }
  }
}, [votesCast]);

// Add this separate useEffect to log whenever messages state changes (helps verify if setMessages actually updated)
useEffect(() => {
  console.log("=== Messages state updated ===");
  console.log("Messages:", messages);
}, [messages]);

  const transformMessage = (msg) => {
    if (msg.message_type === "poll") {
      return {
        ...msg,
        type: "poll",
        poll: {
          id: msg.poll_id,
          question: msg.question,
          options: msg.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            votes: [],
            vote_count: opt.vote_count,
          })),
          multipleChoice: false,
        },
      };
    } else {
      return {
        ...msg,
        type: "text",
      };
    }
  };

  const transformMessages = (rawMessages) => rawMessages.map(transformMessage);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const collabResponse = await Get_All_Collaborators(id);
        setCollaborators(collabResponse.data);
        console.log("Collaborators:", collabResponse.data);

        const chatResponse = await Get_Chat_Messages(id);
        console.log("Chat Messages Response:", chatResponse.data);
        setMessages(transformMessages(chatResponse.data || []));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (messageQueue.length > 0 && id && currentUser?.id) {
      const itineraryId = parseInt(id);
      const relevantMessages = messageQueue.filter(
        (msg) => msg.itinerary_id === itineraryId
      );
      if (relevantMessages.length > 0) {
        console.log(
          "Processing relevant messages for itinerary",
          itineraryId,
          ":",
          relevantMessages
        );
        const messagesToAdd = relevantMessages
          .filter((msg) => msg.sender_id !== currentUser.id)
          .map(({ message_id, itinerary_id, sender_id, text, timestamp }) => ({
            id: message_id,
            itinerary_id,
            sender_id,
            text,
            created_at: timestamp,
            type: "text",
          }))
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        if (messagesToAdd.length > 0) {
          setMessages((prevMessages) => [...prevMessages, ...messagesToAdd]);
        }
        const processedIds = relevantMessages.map((m) => m.message_id);
        setMessageQueue((prev) =>
          prev.filter((m) => !processedIds.includes(m.message_id))
        );
      }
    }
  }, [messageQueue, id, currentUser?.id]);

  useEffect(() => {
    if (!newPollMessage) return;
    const dataofnewpollmessage = {
      itinerary_id: newPollMessage.itinerary_id,
      created_at: newPollMessage.timestamp,
      sender_id: newPollMessage.sender_id,
      message_type: "poll",
      text: "",
      poll_id: newPollMessage.poll.id,
      question: newPollMessage.poll.question,
      options: newPollMessage.poll.options,
      id: newPollMessage.message_id,
    };

    console.log("New poll message data:", dataofnewpollmessage);
    setMessages((prev) => [...prev, transformMessage(dataofnewpollmessage)]);
    setNewPollMessage(null);
  }, [newPollMessage]);

  const isUserOnline = (userId) => {
    return activeUsers && activeUsers.includes(userId);
  };

  const onlineCount = collaborators.filter((collab) =>
    isUserOnline(collab.id)
  ).length;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        const tempMessage = {
          id: `temp-${Date.now()}`,
          itinerary_id: parseInt(id),
          sender_id: currentUser?.id,
          text: message.trim(),
          created_at: new Date().toISOString(),
          type: "text",
        };

        setMessages((prev) => [...prev, tempMessage]);
        setMessage("");

        const data = { itinerary_id: id, text: message.trim() };
        const response = await Send_Chat_Message(data);
        console.log("Message sent response:", response);

        if (response.data) {
          const transformedResponse = transformMessage(response.data);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempMessage.id ? transformedResponse : msg
            )
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setMessages((prev) =>
          prev.filter((msg) => !msg.id.toString().startsWith("temp-"))
        );
        alert("Failed to send message. Please try again.");
      }
    }
  };

  const handleCreatePoll = async (pollData) => {
    const tempPollMessage = {
      id: `poll-${Date.now()}`,
      itinerary_id: parseInt(id),
      sender_id: currentUser?.id,
      type: "poll",
      poll: {
        id: Date.now(),
        question: pollData.question,
        options: pollData.options.map((text, index) => ({
          id: index,
          text,
          votes: [],
          vote_count: 0,
        })),
        multipleChoice: pollData.multipleChoice || false,
      },
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempPollMessage]);

    const data = {
      itinerary_id: id,
      question: pollData.question,
      options: pollData.options,
    };
    console.log("Data to send for poll creation:", data);

    try {
      const res = await Create_Poll_Message(data);
      console.log("Poll created response:", res);
      let transformedResponse = transformMessage(res.data);

      // Fix for newly created poll: Force vote_count to 0 and empty votes array
      // to ensure initial state shows no votes, regardless of server response
      transformedResponse.poll.options = transformedResponse.poll.options.map(
        (opt) => ({
          ...opt,
          votes: [],
          vote_count: 0,
        })
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempPollMessage.id ? transformedResponse : msg
        )
      );
    } catch (err) {
      console.error("Error creating poll:", err);
      setMessages((prev) =>
        prev.filter((msg) => msg.id !== tempPollMessage.id)
      );
      alert("Failed to create poll. Please try again.");
    }
    setShowPollCreator(false);
  };
  const handleVote = async (pollId, optionIndices) => {
    console.log("Messages before voting:", messages);
    // Optimistic update
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.type === "poll" && msg.poll.id === pollId) {
          return {
            ...msg,
            poll: {
              ...msg.poll,
              options: msg.poll.options.map((opt, idx) => {
                if (optionIndices.includes(idx)) {
                  return {
                    ...opt,
                    votes: [...(opt.votes || []), currentUser.id],
                    vote_count: (opt.vote_count || 0) + 1,
                  };
                }
                return opt;
              }),
            },
          };
        }
        return msg;
      })
    );
    console.log("Messages after optimistic update:", messages);
    console.log("Voting for poll:", pollId, "options indices:", optionIndices);

    const pollMsg = messages.find(
      (m) => m.type === "poll" && m.poll.id === pollId
    );
    if (pollMsg && pollMsg.poll) {
      const selectedOptionIds = optionIndices.map(
        (idx) => pollMsg.poll.options[idx]?.id
      );
      console.log("Selected option ids:", selectedOptionIds);

      if (selectedOptionIds.length > 0) {
        const dataToCastVote = {
          poll_id: pollId,
          option_id: selectedOptionIds[0],
        };
        console.log("Data to cast vote:", dataToCastVote);

        try {
          const response = await Cast_Vote(dataToCastVote);
          console.log("Vote response:", response);
        } catch (error) {
          console.error("Error casting vote:", error);
          // Revert optimistic update on error
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.type === "poll" && msg.poll.id === pollId) {
                return {
                  ...msg,
                  poll: {
                    ...msg.poll,
                    options: msg.poll.options.map((opt, idx) => {
                      if (optionIndices.includes(idx)) {
                        return {
                          ...opt,
                          votes: (opt.votes || []).filter(
                            (id) => id !== currentUser.id
                          ),
                          vote_count: Math.max((opt.vote_count || 0) - 1, 0),
                        };
                      }
                      return opt;
                    }),
                  },
                };
              }
              return msg;
            })
          );
          alert("Failed to cast vote. Please try again.");
        }
      }
    }
  };

  const getSenderInfo = (senderId) => {
    if (senderId === currentUser?.id) {
      return {
        name: "You",
        photo: currentUser?.profile_photo,
        isCurrentUser: true,
      };
    }
    const sender = collaborators.find((c) => c.id === senderId);
    return {
      name: sender?.full_name || "Unknown User",
      photo: sender?.profile_photo,
      isCurrentUser: false,
    };
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const renderMessage = (msg, index) => {
    const senderInfo = getSenderInfo(msg.sender_id);
    const showAvatar =
      index === 0 || messages[index - 1]?.sender_id !== msg.sender_id;

    if (msg.type === "poll") {
      return (
        <div
          key={msg.id}
          className={`flex gap-3 w-full ${
            senderInfo.isCurrentUser ? "flex-row-reverse" : ""
          }`}
        >
          <div className="flex-shrink-0 w-8">
            {!senderInfo.isCurrentUser && showAvatar && (
              <>
                {senderInfo.photo ? (
                  <img
                    src={senderInfo.photo}
                    alt={senderInfo.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                    {senderInfo.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </>
            )}
          </div>

          <div
            className={`flex flex-col max-w-md ${
              senderInfo.isCurrentUser ? "items-end" : "items-start"
            }`}
          >
            {!senderInfo.isCurrentUser && showAvatar && (
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 px-1">
                {senderInfo.name} created a poll
              </span>
            )}
            <PollMessage
              poll={msg.poll}
              currentUserId={currentUser?.id}
              onVote={handleVote}
            />
            <span
              className={`text-xs mt-1 px-1 ${
                senderInfo.isCurrentUser
                  ? "text-gray-500 dark:text-gray-400"
                  : "text-gray-400 dark:text-gray-500"
              }`}
            >
              {formatMessageTime(msg.created_at)}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        key={msg.id}
        className={`flex gap-3 ${
          senderInfo.isCurrentUser ? "flex-row-reverse" : ""
        }`}
      >
        <div className="flex-shrink-0 w-8">
          {!senderInfo.isCurrentUser && showAvatar && (
            <>
              {senderInfo.photo ? (
                <img
                  src={senderInfo.photo}
                  alt={senderInfo.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                  {senderInfo.name.charAt(0).toUpperCase()}
                </div>
              )}
            </>
          )}
        </div>

        <div
          className={`flex flex-col ${
            senderInfo.isCurrentUser ? "items-end" : "items-start"
          } max-w-md`}
        >
          {!senderInfo.isCurrentUser && showAvatar && (
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 px-1">
              {senderInfo.name}
            </span>
          )}
          <div
            className={`px-4 py-2 rounded-2xl ${
              senderInfo.isCurrentUser
                ? "bg-teal-500 text-white rounded-br-sm"
                : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm shadow-sm"
            }`}
          >
            <p className="text-sm break-words whitespace-pre-wrap">
              {msg.text}
            </p>
          </div>
          <span
            className={`text-xs mt-1 px-1 ${
              senderInfo.isCurrentUser
                ? "text-gray-500 dark:text-gray-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {formatMessageTime(msg.created_at)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#16181d]">
      {/* Sidebar remains the same */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(`/trips/${id}`)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-teal-600" />
              Group Chat
            </h2>
            <div className="w-9" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {collaborators.length} members
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Circle className="w-2 h-2 fill-green-500 text-green-500 animate-pulse" />
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {onlineCount} online
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Group Members
            </h3>
            {collaborators.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No collaborators yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="relative flex-shrink-0">
                      {collab.profile_photo ? (
                        <img
                          src={collab.profile_photo}
                          alt={collab.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                          {collab.full_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                          isUserOnline(collab.id)
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                        {collab.full_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        @{collab.username}
                      </p>
                    </div>
                    {isUserOnline(collab.id) && (
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
              {currentItinerary?.cover_image ? (
                <img
                  src={currentItinerary.cover_image}
                  alt={currentItinerary.title || "Trip"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {currentItinerary?.title || "Trip Group Chat"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {collaborators.length} members · {onlineCount} online
              </p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-[#16181d]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-gray-400">
                  Loading messages...
                </p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <MessageCircle className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Welcome to the group chat!
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Share updates, coordinate plans, and discuss your trip with
                  all collaborators in one place.
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => renderMessage(msg, index))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus-within:ring-2 focus-within:ring-teal-500">
              <button
                type="button"
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button
                type="button"
                onClick={() => setShowPollCreator(true)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Create Poll"
              >
                <BarChart3 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!message.trim()}
              className="p-3 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-2xl transition-colors shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </form>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            Messages are visible to all {collaborators.length} group members
          </p>
        </div>
      </div>

      <PollCreator
        isOpen={showPollCreator}
        onClose={() => setShowPollCreator(false)}
        onCreatePoll={handleCreatePoll}
      />
    </div>
  );
};

export default Chat;
