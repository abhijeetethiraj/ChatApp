import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";

export const ChatContext = createContext()

export const ChatProvider = ({ children }) => { // ✅ Fixed: children not Children

  const [message, setMessage] = useState([])
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [unseenMessages, setUnseenMessage] = useState({})

  const { socket, axios } = useContext(AuthContext)

  //function to get all user for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users") // ✅ Fixed: messages (plural)
      setUsers(data.users)
      setUnseenMessage(data.unseenMessage)
    } catch (error) {
      toast.error(error.message)
    }
  }

  //function to get message for selected user
  const getMessage = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`) // ✅ Fixed: messages (plural)
      setMessage(data.messages)
    } catch (error) {
      toast.error(error.message)
    }
  }

  // function to send message to selected user
  const sendMessage = async (messageData) => {
    try {
      const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData) // ✅ Fixed: messages (plural)

      if (data.success) {
        setMessage((prevMessage) => [...prevMessage, data.newMessage])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  // function to subscribe to message for selected user
  const subscribeTomessage = () => { // ✅ Fixed: removed async (not needed)
    if (!socket) return

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true
        setMessage((prevMessage) => [...prevMessage, newMessage]) // ✅ Fixed: added prevMessage parameter
        axios.put(`/api/messages/mark/${newMessage._id}`) // ✅ Fixed: messages (plural)
      } else {
        setUnseenMessage((prevUnseenMessage) => ({
          ...prevUnseenMessage, [newMessage.senderId]:
            prevUnseenMessage[newMessage.senderId] ?
              prevUnseenMessage[newMessage.senderId] + 1 : 1
        }))
      }
    })
  }

  // function to unsubscribe from message
  const unsubscribeFromMessage = () => {
    if (socket) socket.off("newMessage")
  }

  useEffect(() => {
    subscribeTomessage()
    return () => unsubscribeFromMessage()
  }, [socket, selectedUser])

  const value = {
    message, users, selectedUser, getUsers, setMessage, sendMessage, setSelectedUser,
    unseenMessages, setUnseenMessage, getMessage // ✅ Added getMessage to value
  }

  return (
    <ChatContext.Provider value={value}>
      {children} {/* ✅ Fixed: children not Children */}
    </ChatContext.Provider>
  )
}