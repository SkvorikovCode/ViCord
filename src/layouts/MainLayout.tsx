import { motion } from 'framer-motion'
import ServerList from '@/components/ServerList'
import ChannelList from '@/components/ChannelList'
import ChatArea from '@/components/ChatArea'

const MainLayout = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex overflow-hidden"
    >
      {/* Server Sidebar */}
      <ServerList />

      {/* Channel List */}
      <ChannelList />

      {/* Main Chat Area */}
      <ChatArea />
    </motion.div>
  )
}

export default MainLayout

