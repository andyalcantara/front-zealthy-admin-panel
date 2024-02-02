import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { URL } from './constants';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';

const ticketColors = {
  New: 'status-new',
  InProgress: 'status-in-progress',
  Resolved: 'status-resolved'
}

const statusText = {
  New: 'New',
  InProgress: 'In Progress',
  Resolved: 'Resolved'
}

function App() {
  const [tickets, setTickets] = useState([]);
  const [isThereChange, setIsThereChange] = useState(false);
  const [ticketSelected, setTicketSelected] = useState(null);

  const [comment, setComment] = useState('');
  const [statusSelected, setStatusSelected] = useState('');

  useEffect(() => {
    fetch(URL + 'tickets')
      .then((response) => response.json())
      .then((tickets) => {
        setTickets(tickets);
        if (ticketSelected) {
          const selectedTicket = tickets.find((ticket) => ticket._id === ticketSelected._id);
          setTicketSelected(selectedTicket);
        }
      });
    
    setIsThereChange(false);
  }, [isThereChange]);

  const selectTicket = (ticket) => {
    setTicketSelected(ticket);
  }

  const updateStatus = (event) => {
    setStatusSelected(event.target.value);
  }

  const handleFormSubmission = async (event) => {
    event.preventDefault();

    const body = {
      comment: comment,
    };
    const response = await fetch(URL + `tickets/${ticketSelected._id}/comment`, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
    });

    const data = await response.json();

    if (data) {
      setComment('');
    }
    setIsThereChange(true);
  }

  const handleStatusSave = async () => {
    if (statusSelected) {
      const body = {
        value: statusSelected
      };

      const response = await fetch(URL + `tickets/${ticketSelected._id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      setStatusSelected('');
      setIsThereChange(true);

      if (statusSelected === 'Resolved') {
        console.log(`Would normally send email here with body: ${ticketSelected ? ticketSelected.name : ''} your ticket has been resolved`);
      }
    }
  }

  return (
  <div className="App">
    <h1>Welcome to Zealthy Admin Panel</h1>

    <div className='table-container'>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Description</th>
            <th>Image/Document</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket, index) => {
            const {name, email, description, file, ticketStatus} = ticket;
            
            return (
              <tr 
                key={`${email}+${index}`} 
                className={['body-row', 'hover-to-select', ticketStatus === 'Resolved' ? 'green-border' : ''].join(' ')}
                onClick={() => selectTicket(ticket)}
              >
                <td>{name}</td>
                <td>{email}</td>
                <td>{description}</td>
                <td>
                  {(file.split('.')[1] === 'jpg' || file.split('.')[1] === 'png' || file.split('.')[1] === 'jpeg') ?
                    <img className='small-image' src={URL + file} /> :
                    <a onClick={(e) => e.stopPropagation()} href={URL + file} target='_blank'>{file}</a>
                  }
                </td>
                <td>
                  <p className={[ticketColors[ticketStatus], 'status-value'].join(' ')}>
                    {statusText[ticketStatus]}
                  </p>
                </td>
              </tr>
            );
          
          })}
        </tbody>
      </Table>
    </div>
    <Modal
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
      show={ticketSelected}
      onHide={() => setTicketSelected(null)}
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {ticketSelected && ticketSelected.name} - {ticketSelected && ticketSelected.email}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {ticketSelected && (
          <div className='selected-container'>
            <div className='comments-container'>
              <h3>Comments</h3>
              {ticketSelected && ticketSelected.comments.length ? (
                <div>
                  {ticketSelected.comments.map((comment, index) => {
                    return <p key={`${comment}-+${index}`}>{comment}</p>
                  })}
                </div>
              ) : null}
            </div>

            <div className='actions'>
              <h2>Actions</h2>
                <div className='actions-container'>
                  <form className='form' onSubmit={handleFormSubmission}>
                    <label>Comment:</label>
                    <input id='comment' value={comment} onChange={(e) => setComment(e.target.value)} />

                    <button type='submit' className='send-comment-btn'>Send Comment</button>
                  </form>
                  <select value={statusSelected} onChange={updateStatus}>
                    <option value={''}>-----------</option>
                    <option value={'New'}>New</option>
                    <option value={'InProgress'}>In Progress</option>
                    <option value={'Resolved'}>Resolved</option>
                  </select>

                  <button disabled={!statusSelected} className='save-button' onClick={handleStatusSave}>Save Changes</button>
                </div>
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={() => setTicketSelected(null)}>Close</Button>
      </Modal.Footer>
    </Modal>
      
    </div>
  );
}

export default App;
