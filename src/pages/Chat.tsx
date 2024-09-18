import { useState } from 'react';
import GlobalConnect from '../components/Global/GlobalConnect';

const Chat: React.FC = () => {
    const [selectedCanvasser, setSelectedCanvasser] = useState<string>('Canvasser 1');
    const [messages, setMessages] = useState([
        { sender: 'Canvasser 1', text: 'Hi there! How can I help you?' },
        { sender: 'You', text: 'Just checking in on the new canvassing area.' }
    ]);

    // Function to handle switching between canvassers
    const handleCanvasserClick = (canvasser: string) => {
        setSelectedCanvasser(canvasser);

        // Mock new chat data based on selected canvasser
        if (canvasser === 'Canvasser 1') {
            setMessages([
                { sender: 'Canvasser 1', text: 'Hi there! How can I help you?' },
                { sender: 'You', text: 'Just checking in on the new canvassing area.' }
            ]);
        } else if (canvasser === 'Canvasser 2') {
            setMessages([
                { sender: 'Canvasser 2', text: 'Hello! Are we set for the upcoming event?' },
                { sender: 'You', text: 'Yes, everything is ready.' }
            ]);
        } else {
            setMessages([
                { sender: 'Canvasser Group 1', text: 'Team, please update your progress.' },
                { sender: 'You', text: 'I’ve completed my area.' }
            ]);
        }
    };

    return (
        <>
            <GlobalConnect pageName="Chat for Canvassers" />
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-1/4 p-4 bg-gray-200 dark:bg-gray-800 text-black dark:text-white">
                    <h2 className="text-xl font-bold mb-4">Canvasser</h2>
                    <ul>
                        <li className="mb-2">
                            <button
                                className={`w-full text-left px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 ${selectedCanvasser === 'Canvasser 1' ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
                                onClick={() => handleCanvasserClick('Canvasser 1')}
                            >
                                Canvasser 1
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                className={`w-full text-left px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 ${selectedCanvasser === 'Canvasser 2' ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
                                onClick={() => handleCanvasserClick('Canvasser 2')}
                            >
                                Canvasser 2
                            </button>
                        </li>
                        <li className="mb-2">
                            <button
                                className={`w-full text-left px-4 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 ${selectedCanvasser === 'Canvasser Group 1' ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
                                onClick={() => handleCanvasserClick('Canvasser Group 1')}
                            >
                                Canvasser Group 1
                            </button>
                        </li>
                    </ul>
                </div>

                {/* Chat Area */}
                <div className="flex flex-col w-3/4 bg-white dark:bg-gray-900">
                    {/* Chat Header */}
                    <div className="border-b p-4 bg-gray-100 dark:bg-gray-600">
                        <h2
                            className="text-xl font-bold"
                            style={{ color: 'black' }}
                        >
                            Chat with {selectedCanvasser}
                        </h2>
                    </div>


                    {/* Chat Messages */}
                    <div className="flex-1 p-10 overflow-y-auto">
                        {messages.map((message, index) => (
                            <div key={index} className={`mb-4 ${message.sender === 'You' ? 'text-right' : ''}`}>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{message.sender}</p>
                                <div className={`p-2 rounded-lg inline-block mt-1 ${message.sender === 'You' ? 'bg-green-100 dark:bg-green-800 text-black dark:text-white' : 'bg-blue-100 dark:bg-blue-800 text-black dark:text-white'}`}>
                                    {message.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t bg-gray-100 dark:bg-gray-700">
                        <form className="flex">
                            <input
                                type="text"
                                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none dark:bg-gray-800 dark:text-gray-300"
                                placeholder="Type your message here..."
                            />
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-900"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chat;
