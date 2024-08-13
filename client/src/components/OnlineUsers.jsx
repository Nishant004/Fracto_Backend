import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const OnlineUsers = ({ user }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socket = io('http://localhost:8000');

  useEffect(() => {
    if (user) {
      socket.emit('user-login', { userId: user._id });

      socket.on('online-users', (users) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.emit('user-logout', { userId: user._id });
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <div>
      <h3>Online Users</h3>
      <ul>
        {onlineUsers.map((userId) => (
          <li key={userId}>{userId}</li>
        ))}
      </ul>
    </div>
  );
};

export default OnlineUsers;
