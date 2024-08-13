import { useState } from 'react';
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import OnlineUsers from './components/OnlineUsers';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      <h1>User Management System</h1>
      {!user ? (
        <>
          <RegisterForm />
          <LoginForm onLogin={setUser} />
        </>
      ) : (
        <OnlineUsers user={user} />
      )}
    </div>
  );
}

export default App;
