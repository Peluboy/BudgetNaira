// Request notification permission
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

// Send a notification for split expenses
export const sendSplitExpenseNotification = (expenseDescription: string, amount: number) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification('Split Expense', {
      body: `You've been added to a split expense: ${expenseDescription} - ₦${amount.toLocaleString()}`,
      icon: '/logo.png'
    });
    
    notification.onclick = function() {
      window.focus();
      this.close();
    };
  }
};

// Send a reminder notification
export const sendReminder = (participantName: string, expenseDescription: string, amount: number) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification('Payment Reminder', {
      body: `Reminder: ${participantName} owes you ₦${amount.toLocaleString()} for ${expenseDescription}`,
      icon: '/logo.png'
    });
    
    notification.onclick = function() {
      window.focus();
      this.close();
    };
  }
};