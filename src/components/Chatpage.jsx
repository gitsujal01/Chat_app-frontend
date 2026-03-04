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

const {roomId,currentUser,connected,setConnected,setroomId,setcurrentUser} = useChatContext();
// console.log(roomId);
// console.log(currentUser);
// console.log(connected);  

const navigate=useNavigate()
useEffect(()=>
{ if(!connected)
{
  navigate('/')
}},[connected,roomId,currentUser])

const[message, setMessages] = useState([]);
const[input,setInput] = useState("");
const inputRef=useRef(null);
const chatBoxRef = useRef(null);
const [stompClient,setStompClient]=useState(null);



//messages page load
useEffect(() => {
  async function loadMessages()
  {
     try {
        const messages = await getMessages(roomId);
        // console.log(messages);  
        setMessages(messages);
     } catch (error) {
      
     } 
  }
  if(connected)
  {
    loadMessages();
  }
},[]);
useEffect(()=>{

  if(chatBoxRef.current)
  {
    chatBoxRef.current.scroll({
      top:chatBoxRef.current.scrollHeight,
      behavior:"smooth",

    });
  }

},[message]

)
//stomp init
   useEffect(()=>{

    const connectWebSocket=()=>{
        const sock = new SockJS(`${baseUrl}/chat`);
        const client = Stomp.over(sock); // ✅ Pass a function

        client.connect({},()=>
        {
            setStompClient(client);

            toast.success("Connected");

        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log(message);

          const newMessage = JSON.parse(message.body);

          setMessages((prev) => [...prev, newMessage]);

            });
        });

    };
    if(connected)
    {
      connectWebSocket();
    }

   },[roomId]);

const sendMessage = async ()=> {
    if(stompClient && connected && input.trim()){
      console.log(input);
      
        const message={
          sender:currentUser,
          content:input,
          roomId:roomId,
          timestamp: new Date().toString()
        }
        stompClient.send(`/app/sendMessage/${roomId}`,{},JSON.stringify(message));
        setInput("");
        }
    };   
function handleLogout()
{
  if(stompClient)
  {
    stompClient.disconnect(()=>{
      console.log("Left the chat")
    })
  }
  stompClient.disconnect();
  setConnected(false);
  setroomId("");
  setcurrentUser("");
  navigate('/');
}
return (
    <div className=''>
    {/*header portion for chatapp*/}
   <header className='dark:border-gray-700 h-20 fixed w-full dark:bg-gray-900 py-6 flex justify-around items-center'>
    {/*room name container*/}
    <div>
       <h1 className='text-xl font-semibold'>
         Room : <span>{roomId}</span>
       </h1>
    </div>
    {/*username container*/}
    <div className=''>
       <h1 className='text-xl font-semibold'>
         User : <span>{currentUser}</span>
       </h1>
    </div>
    {/*button : leave room*/}
    <div className=''>
       <button onClick={handleLogout} className='dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full'>Leave Room</button> 
    </div>
   </header>
    {/*chat app space*/}
    <main ref={chatBoxRef} className='py-20 px-10 border w-2/3 dark:bg-slate-600 mx-auto h-screen overflow-auto'>
        {message.map((message, index)=>(
            <div
               key={index}
               className={`flex ${
                 message.sender === currentUser ? "justify-end":"justify-start"
                } `}
              >
                <div className={`my-2 ${message.sender === currentUser ? 'bg-green-800':'bg-gray-800'} bg-purple-500 p-2 max-w-xs rounded`}>
                    <div className='flex flex-row gap-2'>
                        <img
                         className='h-10 w-10' 
                         src= {'https://avatar.iran.liara.run/public/33'}
                        />
                    <div className='flex flex-col gap-1' >
                        <p className='text-sm font-bold'>{message.sender}</p>
                        <p>{message.content}</p>
                        <p className='text-xs text-gray-200'>{timeAgo(message.timestamp)}</p>
                    </div>
                    </div>
                </div>
              </div>
            ))
        }    
    </main>

   {/*input message container*/}
     <div className='fixed bottom-2 w-full h-14'>
        <div className='h-full pr-10 flex gap-4 items-center  justify-between  rounded-full w-1/2 mx-auto dark:bg-gray-900'>
            <input value={input} onChange={(e)=>{setInput(e.target.value)}}onKeyDown={(e)=>{
              if(e.key==="Enter")
              {
                sendMessage();
              }
            }} type='text' placeholder='Type your message here' className='focus:outline-none dark:border-gray-600 w-full dark:bg-gray-800 px-5 py-2 rounded-full h-full '>
           </input>
        <div className='flex gap-1'>
            <button className="dark:bg-purple-600 h-10 w-10  flex   justify-center items-center rounded-full">
             <MdAttachFile size={20} />
            </button>
            <button onClick={sendMessage} className="dark:bg-green-600 h-10 w-10  flex   justify-center items-center rounded-full">
             <MdSend size={20} />
            </button>
       
        </div>
        
        </div>
      </div> 
   </div>

);
}

export default Chatpage