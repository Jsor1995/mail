document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // Send Mail 
  document.querySelector('#form-submit').onclick=send_mail;

  // By default, load the inbox
  load_mailbox('inbox');

  
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  console.log(mailbox);
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#mail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

   //Fetch mailbox emails
   console.log("Are we in box")
   fetch(`/emails/${mailbox}`)
   .then(response => response.json())
   .then(emails => {
     console.log(emails);
    
     for (let i in emails) {
       //add in html
       let currentMail = emails[i];
       const newDiv = document.createElement('div');
       newDiv.id='mail-container';
       newDiv.value = currentMail.id;
       
       const categories = ['sender', 'subject', 'timestamp'];
       for (let j in categories) {
         let currentCategory = categories[j]
         let currentDiv = document.createElement('div');
         currentDiv.id=currentCategory;
         currentDiv.innerHTML = currentMail[currentCategory];

         newDiv.appendChild(currentDiv);
       };
       const emailView = document.querySelector('#emails-view');
       newDiv.onclick = function() {
         view_mail(newDiv.value);
       };
       emailView.appendChild(newDiv);
     };
   })
}

function send_mail() {
  // Fetch data values from form
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;
  console.log("Are we in?");
  // Convert to JSON and send to backend
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => console.log(result))
  console.log("went through API");
  load_mailbox("sent");
}

function view_mail(id) {
  //Hide emails
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'block';

  console.log("checking if in view_mail");
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
    let mailView = document.querySelector('#mail-view');
    const header = document.createElement('div');
    const replyButton = document.createElement('button');
    const archiveButton = document.createElement('button');
    const entry = document.createElement('div')
    //clear html in mailView
    mailView.innerHTML = "";

    header.id = "mail-header";
    header.innerHTML = 
      `<div><b>From: </b><span>${email.sender}</span></div>
      <div><b>To: </b><span>${email.recipients}</span></div>
      <div><b>Subject: </b><span>${email.subject}</span></div>
      <div><b>Timestamp: </b><span>${email.timestamp}</span></div>`;

    replyButton.className = "btn btn-sm btn-outline-primary";
    replyButton.id = "reply-button";
    replyButton.innerHTML = "Reply";
    header.appendChild(replyButton);

    archiveButton.className = "btn btn-sm btn-outline-primary";
    archiveButton.id = "archive-button";
    archiveButton.innerHTML = "Archive";
    archiveButton.onclick = function() {
      archive_mail(id);
    }
    header.appendChild(archiveButton)
    entry.innerHTML = `<hr><p>${email.body}</p>`

    mailView.appendChild(header);
    mailView.appendChild(entry);    
  });

  
  function archive_mail(id) {
    console.log("archiving");
    fetch(`/emails/${id}`,{
      method: 'PUT',
      body: JSON.stringify({
        archived: true
      })
    })
  };
}
