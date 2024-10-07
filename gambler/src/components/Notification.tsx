import React from 'react';
import '../index.css';

interface NotificationProps {
    errormessage: string;
    notificationmessage: string
}

const Notification = ({
  errormessage,
  notificationmessage
}: NotificationProps) => {
  if (errormessage === '' && notificationmessage === '') {
    return null;
  }

  if (errormessage) {
    return (
      <div className="notificationcontainer">
        <div className="error">
          {errormessage}
        </div>
      </div>
    );
  }

  if (notificationmessage) {
    return (
      <div className="notificationcontainer">
        <div className="notification">
          {notificationmessage}
        </div>
      </div>
    );
  }
};



export default Notification;