import React, { useEffect, useRef, useState } from 'react'
import { MdAttachFile, MdSend } from 'react-icons/md';
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';
import SockJS from 'sockjs-client';
import { baseUrl } from '../config/AxiosHelper';
import { Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { getMessages } from '../services/RoomService';
import { timeAgo } from '../config/helper';

const Chatpage = () => {

  const { roomId, currentUser, connected, setConnected, setroomId, setcurrentUser } = useChatContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!connected) {
      navigate('/');
    }
  }, [connected, roomId, currentUser]);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  // Load old messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getMessages(roomId);
        setMessages(data);
      } catch (error) {
        console.log(error);
      }
    }

    if (connected) {
      loadMessages();
    }
  }, []);

  // Auto scroll
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scroll({
        top: chatBoxRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  // WebSocket connect
  useEffect(() => {
    const connectWebSocket = () => {
      const sock = new SockJS(`${baseUrl}/chat`);
      const client = Stomp.over(() => sock);

      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected");

        client.subscribe(`/topic/room/${roomId}`, (msg) => {
          const newMessage = JSON.parse(msg.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };

    if (connected) {
      connectWebSocket();
    }
  }, [roomId]);

  // Send message
  const sendMessage = () => {
    if (stompClient && connected && input.trim()) {
      const message = {
        sender: currentUser,
        content: input,
        roomId: roomId,
        timestamp: new Date().toISOString()
      };

      stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(message));
      setInput("");
    }
  };

  function handleLogout() {
    if (stompClient) {
      stompClient.disconnect();
    }

    setConnected(false);
    setroomId("");
    setcurrentUser("");
    localStorage.clear();
    navigate('/');
  }

  return (
    <div>

      {/* HEADER */}
      <header className='dark:border-gray-700 h-20 fixed w-full dark:bg-gray-900 py-6 flex justify-around items-center'>
        <h1 className='text-xl font-semibold'>Room : <span>{roomId}</span></h1>
        <h1 className='text-xl font-semibold'>User : <span>{currentUser}</span></h1>
        <button onClick={handleLogout} className='dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full'>
          Leave Room
        </button>
      </header>

      {/* CHAT AREA */}
      <main ref={chatBoxRef} className='py-24 px-10 border w-2/3 dark:bg-slate-600 mx-auto h-screen overflow-auto'>
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === currentUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`my-2 p-2 max-w-xs rounded-lg shadow ${
                msg.sender === currentUser
                  ? "bg-green-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              <div className='flex flex-row gap-2'>
                <img
                  className="h-10 w-10 rounded-full"
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(msg.sender)}`}
                  alt="avatar"
                />
                <div className='flex flex-col gap-1'>
                  <p className='text-sm font-bold'>{msg.sender}</p>
                  <p>{msg.content}</p>
                  <p className='text-xs text-gray-500'>{timeAgo(msg.timestamp)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* INPUT BOX */}
      <div className='fixed bottom-2 w-full h-14'>
        <div className='h-full pr-10 flex gap-4 items-center justify-between rounded-full w-1/2 mx-auto dark:bg-gray-900'>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            type='text'
            placeholder='Type your message here'
            className='focus:outline-none dark:border-gray-600 w-full dark:bg-gray-800 px-5 py-2 rounded-full h-full'
          />

          <div className='flex gap-1'>
            <button className="dark:bg-purple-600 h-10 w-10 flex justify-center items-center rounded-full">
              <MdAttachFile size={20} />
            </button>
            <button onClick={sendMessage} className="dark:bg-green-600 h-10 w-10 flex justify-center items-center rounded-full">
              <MdSend size={20} />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Chatpage;