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
      <div className="error">
        {errormessage}
      </div>
    );
  }

  if (notificationmessage) {
    return (
      <div className="notification">
        {notificationmessage}
      </div>
    );
  }
};



export default Notification;