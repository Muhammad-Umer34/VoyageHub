import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Check, Users } from "lucide-react";
import { Did_I_Vote } from "../api/auth";

const PollMessage = ({ poll, currentUserId, onVote }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [localOptions, setLocalOptions] = useState([]);

  useEffect(() => {
    console.log("PollMessage component mounted with poll:", poll);
    console.log("Current user ID:", currentUserId);
    setLocalOptions(poll.options); // Initial set
    const checkVoteStatus = async () => {
      try {
        const response = await Did_I_Vote(poll.id);
        console.log("User vote status response:", response);
        console.log(`User has voted: ${response.data.did_vote}`);
        if (response.data.did_vote) {
          setHasVoted(true);
          const votedOptionId = response.data.poll_option_id;
          const votedIndex = poll.options.findIndex((opt) => opt.id === votedOptionId);
          if (votedIndex !== -1) {
            setSelectedOptions([votedIndex]);
          }
        }
      } catch (error) {
        console.error("Error checking vote status:", error);
      }
    };
    checkVoteStatus();
  }, [poll, currentUserId]);

  const totalVotes = localOptions.reduce((sum, opt) => sum + (opt.votes?.length || opt.vote_count || 0), 0);

  const getVotePercentage = (option) => {
    const voteLength = option.votes?.length || option.vote_count || 0;
    if (totalVotes === 0) return 0;
    return Math.round((voteLength / totalVotes) * 100);
  };

  const hasUserVoted = (option) => {
    return option.votes?.includes(currentUserId);
  };

  const handleOptionToggle = (optionIndex) => {
    if (hasVoted) return;

    if (poll.multipleChoice) {
      setSelectedOptions((prev) =>
        prev.includes(optionIndex)
          ? prev.filter((i) => i !== optionIndex)
          : [...prev, optionIndex]
      );
    } else {
      setSelectedOptions([optionIndex]);
    }
  };

  const handleVoteSubmit = () => {
    if (selectedOptions.length > 0 && !hasVoted) {
      onVote(poll.id, selectedOptions);
      setHasVoted(true);
    }
  };

  const userHasVotedInPoll = hasVoted;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm"
    >
      {/* Poll Header */}
      <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
            Poll
          </span>
        </div>
        <h4 className="font-semibold text-gray-900 dark:text-white">
          {poll.question}
        </h4>
      </div>

      {/* Poll Options */}
      <div className="p-4 space-y-3">
        {localOptions.map((option, index) => {
          const percentage = getVotePercentage(option);
          const voteCount = option.votes?.length || option.vote_count || 0;
          const isSelected = selectedOptions.includes(index);
          const userVotedThis = hasUserVoted(option);

          return (
            <motion.button
              key={index}
              whileHover={!userHasVotedInPoll ? { scale: 1.02 } : {}}
              whileTap={!userHasVotedInPoll ? { scale: 0.98 } : {}}
              onClick={() => handleOptionToggle(index)}
              disabled={userHasVotedInPoll}
              className={`w-full text-left relative overflow-hidden rounded-lg transition-all ${
                userHasVotedInPoll
                  ? "cursor-default"
                  : "cursor-pointer hover:shadow-md"
              } ${
                isSelected
                  ? "ring-2 ring-teal-500"
                  : "border border-gray-200 dark:border-gray-700"
              }`}
            >
              {/* Progress Bar Background */}
              {userHasVotedInPoll && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 bg-teal-100 dark:bg-teal-900/20"
                />
              )}

              {/* Option Content */}
              <div className="relative p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {/* Checkbox/Radio */}
                  <div
                    className={`w-5 h-5 flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                      poll.multipleChoice ? "rounded-md" : "rounded-full"
                    } ${
                      isSelected || userVotedThis
                        ? "border-teal-500 bg-teal-500"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {(isSelected || userVotedThis) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </div>

                  {/* Option Text */}
                  <span className="font-medium text-gray-900 dark:text-white flex-1">
                    {option.text}
                  </span>
                </div>

                {/* Vote Count & Percentage */}
                {userHasVotedInPoll && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {percentage}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({voteCount})
                    </span>
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Poll Footer */}
      <div className="px-4 pb-4">
        {!userHasVotedInPoll ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleVoteSubmit}
            disabled={selectedOptions.length === 0}
            className="w-full px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
          >
            {selectedOptions.length === 0
              ? "Select an option to vote"
              : `Submit Vote${selectedOptions.length > 1 ? "s" : ""}`}
          </motion.button>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>
                {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
              </span>
            </div>
            <span className="text-teal-600 dark:text-teal-400 font-medium">
              ✓ You voted
            </span>
          </div>
        )}

        {poll.multipleChoice && !userHasVotedInPoll && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            You can select multiple options
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PollMessage;