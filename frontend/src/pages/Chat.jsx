import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  MessageCircle,
  Send,
  Users,
  Circle,
  ArrowLeft,
  MoreVertical,
  Image as ImageIcon,
  Smile,
} from "lucide-react";
import { Get_All_Collaborators, Send_Chat_Message, Get_Chat_Messages } from "../api/auth";
import { useParams, useNavigate } from "react-router-dom";
import { useWebSocket } from "../contexts/WebSocketContext";
import { useSelector } from "react-redux";

const Chat = () => {
  const { activeUsers, messageQueue, setMessageQueue } = useWebSocket();
  const currentUser = useSelector((state) => state.profile);
  const [collaborators, setCollaborators] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const { id } = useParams();
  const itineraries = useSelector((state) => state.itinerary.itineraries);
  const currentItinerary = itineraries.find(
    (itinerary) => itinerary.id === parseInt(id)
  );
  const navigate = useNavigate();

  // Scroll to bottom of messages
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
        
        // Fetch collaborators
        const collabResponse = await Get_All_Collaborators(id);
        setCollaborators(collabResponse.data);
        console.log("Collaborators:", collabResponse.data);
        
        // Fetch chat messages
        const chatResponse = await Get_Chat_Messages(id);
        console.log("Chat Messages Response:", chatResponse.data);
        setMessages(chatResponse.data || []);
        
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
        console.log("Processing relevant messages for itinerary", itineraryId, ":", relevantMessages);
        const messagesToAdd = relevantMessages
          .filter((msg) => msg.sender_id !== currentUser.id)
          .map(({ message_id, itinerary_id, sender_id, text, timestamp }) => ({
            id: message_id,
            itinerary_id,
            sender_id,
            text,
            created_at: timestamp,
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

  // Check if user is online
  const isUserOnline = (userId) => {
    return activeUsers && activeUsers.includes(userId);
  };

  // Get online collaborators count
  const onlineCount = collaborators.filter((collab) =>
    isUserOnline(collab.id)
  ).length;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim()) {
      try {
        // Optimistic UI update
        const tempMessage = {
          id: `temp-${Date.now()}`,
          itinerary_id: parseInt(id),
          sender_id: currentUser?.id,
          text: message.trim(),
          created_at: new Date().toISOString(),
        };
        
        setMessages((prev) => [...prev, tempMessage]);
        setMessage("");

        // Send to backend
        const data = { itinerary_id: id, text: message.trim() };
        const response = await Send_Chat_Message(data);
        console.log("Message sent response:", response);

        if (response.data) {
          setMessages((prev) => 
            prev.map((msg) => 
              msg.id === tempMessage.id ? response.data : msg
            )
          );
        }
      } catch (error) {
        console.error("Error sending message:", error);
        // Remove temp message on error
        setMessages((prev) => prev.filter((msg) => !msg.id.toString().startsWith("temp-")));
        alert("Failed to send message. Please try again.");
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
      // Show time for messages within last 24 hours
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      // Show "Yesterday" for messages from yesterday
      return `Yesterday ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      // Show date for older messages
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#16181d]">
      {/* Sidebar - Group Members */}
      <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
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
            <div className="w-9" /> {/* Spacer for alignment */}
          </div>

          {/* Group Info */}
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

        {/* Members List */}
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
                    {/* Avatar */}
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
                      {/* Online Indicator */}
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
                          isUserOnline(collab.id)
                            ? "bg-green-500"
                            : "bg-gray-400"
                        }`}
                      />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate text-sm">
                        {collab.full_name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        @{collab.username}
                      </p>
                    </div>

                    {/* Online Badge */}
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
        {/* Chat Header */}
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

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-[#16181d]">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
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
              {messages.map((msg, index) => {
                const senderInfo = getSenderInfo(msg.sender_id);
                const showAvatar =
                  index === 0 || messages[index - 1]?.sender_id !== msg.sender_id;
                
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${
                      senderInfo.isCurrentUser ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
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

                    {/* Message Bubble */}
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
                        <p className="text-sm break-words whitespace-pre-wrap">{msg.text}</p>
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
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus-within:ring-2 focus-within:ring-teal-500">
              <button
                type="button"
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ImageIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                type="button"
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Smile className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
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
    </div>
  );
};

export default Chat;