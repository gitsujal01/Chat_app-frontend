import React, { useState } from 'react';
import chatIcon from "../assets/chatt.png";
import toast from 'react-hot-toast';
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from '../context/ChatContext';
import { useNavigate } from 'react-router';


const JoinCreateChat = () => {
  const [detail, setDetail] = useState({
    roomId: '',
    userName: '',
  });

  const { setRoomId, setCurrentUser, setConnected } = useChatContext();
  const navigate = useNavigate();

  // Input change handler
  function handleFormInputChange(event) {
    setDetail({
      ...detail,
      [event.target.name]: event.target.value,
    });
  }

  // Form validation
  function validateForm() {
    if (detail.roomId.trim() === "" || detail.userName.trim() === "") {
      toast.error("Invalid Input!");
      return false;
    }
    return true;
  }

  // Join chat function
  async function joinChat() {
    if (!validateForm()) return;

    try {
      const room = await joinChatApi(detail.roomId.trim());
      toast.success("Joined successfully!");
      setCurrentUser(detail.userName.trim());
      setRoomId(room.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error?.response?.status === 404) {
        toast.error(error.response.data || "Room not found!");
      } else {
        toast.error("Error in joining room!");
      }
      console.log(error);
    }
  }

  // Create room function
  async function createRoom() {
    if (!validateForm()) return;

    try {
      const response = await createRoomApi(detail.roomId.trim());
      toast.success("Room created successfully!");
      setCurrentUser(detail.userName.trim());
      setRoomId(response.roomId);
      setConnected(true);
      navigate("/chat");
    } catch (error) {
      if (error?.response?.status === 400) {
        toast.error("Room already exists!");
      } else {
        toast.error("Error in creating room!");
      }
      console.log(error);
    }
  }

  // Form submit with Enter key
  function handleFormSubmit(event) {
    event.preventDefault();
    joinChat();
  }

  return (
    <div className='min-h-screen flex items-center justify-center'>
      <form
        onSubmit={handleFormSubmit}
        className='p-10 dark:border-gray-700 border w-full flex flex-col gap-5 max-w-md rounded dark:bg-gray-900 shadow'
      >
        <div>
          <img src={chatIcon} className='w-24 mx-auto' />
        </div>
        <h1 className='text-2xl font-semibold text-center'>Join Room / Join Chat</h1>

        {/* User Name */}
        <div>
          <label htmlFor="userName" className='block font-medium mb-2'>Your Name</label>
          <input
            type='text'
            id='userName'
            name='userName'
            placeholder='Enter your name'
            value={detail.userName}
            onChange={handleFormInputChange}
            className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        {/* Room ID */}
        <div>
          <label htmlFor="roomId" className='block font-medium mb-2'>Room ID / New Room ID</label>
          <input
            type='text'
            id='roomId'
            name='roomId'
            placeholder='Enter Room ID'
            value={detail.roomId}
            onChange={handleFormInputChange}
            className='w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        {/* Buttons */}
        <div className='flex justify-center gap-2 mt-4'>
          <button
            type='submit'
            className='px-3 py-2 dark:bg-blue-500 hover:dark:bg-blue-800 rounded-full'
          >
            Join Room
          </button>
          <button
            type='button'
            onClick={createRoom}
            className='px-3 py-2 dark:bg-teal-500 hover:dark:bg-green-800 rounded-full'
          >
            Create Room
          </button>
        </div>
      </form>
    </div>
  );
};

export default JoinCreateChat;
