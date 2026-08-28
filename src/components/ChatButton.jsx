export default function ChatButton({ unread, onClick }) {
  return (
    <button className="chatbtn" onClick={onClick}>
      💬 Chat <span className={'bump' + (unread > 0 ? ' show' : '')}>{unread || 1}</span>
    </button>
  )
}
