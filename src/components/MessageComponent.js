
const MessageComponent = ({ messages=[], currentUser,user,formatTimestamp,messagesEndRef  }) => {
    return (
        <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg mb-2 ${
                currentUser.id === msg.sender
                  ? 'bg-blue-500 text-white self-end'
                  : 'bg-gray-400  text-white self-end'
              }`}
              style={{
                maxWidth: '50%',
                marginLeft: currentUser.id === msg.sender ? 'auto' : '0',
              }}
            >
                    {msg.message_type === 'text' ? ( 
                        <span>{msg.message}</span>
                    ) : msg.file ? ( 
                        // Check the media type to render images, GIFs, or videos
                        <>
                        {msg.message_type === 'image' ? (
                            <img
                                src={msg.file}
                                alt="Image"
                                className="max-w-full w-[300px] h-auto object-cover rounded-lg shadow-md"
                            />
                        ) : msg.message_type === 'video' ? (
                            <video
                                src={msg.file}
                                controls
                                className="max-w-full w-[300px] h-auto rounded-lg shadow-md"
                            />
                            ) : msg.message_type === 'gif' ? (
                                <img
                                    src={msg.file}
                                    alt="GIF"
                                    className="max-w-full w-[300px] h-auto object-cover rounded-lg shadow-md"
                                />
                            ) : (
                                <span>No file available</span> // Optional fallback for unrecognized file types
                            )}
                        </>
                    ) : (
                        <span>No message available</span>
                    )}
                   <div className="message-status flex items-center mt-1">
                    {/* Sent, Delivered, Read Status */}
                    {msg.read_by?.includes(currentUser.id) ? (
                        <div className="flex items-center">
                            <span className="text-green-500" title="Read">
                                ✔✔
                            </span>
                            <span className="ml-1 text-xs text-white">Read</span>
                        </div>
                    ) : msg.read_by?.includes(user.id) ? (
                        <div className="flex items-center">
                            <span className="text-yellow-500" title="Delivered">
                                ✔✔
                            </span>
                            <span className="ml-1 text-xs text-white">Seen</span>
                        </div>
                    ) : msg.read_by?.length > 0 ? (
                        <div className="flex items-center">
                            <span className="text-white" title="Delivered">
                                ✔✔
                            </span>
                            <span className="ml-1 text-xs text-white">Delivered</span>
                        </div>
                    ) : (
                        <div className="flex items-center">
                            <span className="text-white" title="Sent">
                                ✔
                            </span>
                            <span className="ml-1 text-xs text-white">Sent</span>
                        </div>
                    )}
                </div>

              <div className="text-xs text-orange-50 mt-1 text-right">
                {formatTimestamp(msg.timestamp)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageComponent;