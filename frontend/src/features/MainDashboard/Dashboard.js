import React, { Component, useEffect } from 'react'
import DashboardChat from './DashboardChat/DashboardChat'
import DashboardMainContent from './DashboardMainContent/DashboardMainContent'
import DashboardSidebar from './DashboardSidebar/DashboardSidebar'
import queryString from 'query-string';
import "./dashboard.css"
import { baseURL, pusher } from '../../utils/constant';
import axios from 'axios'
import jwtDecode from 'jwt-decode';

export class Dashboard extends Component {
  state = {
    users: [],
    chatHistory: [],
    oldHistory: {},
    name: '',
    error: '',
    room: '',
    userID: '',
    roomDetails: {},
    topic: '',
    tokenUser: {},
    roomID: '',
  }
  async componentDidMount() {


    const ROOM = pusher.subscribe('ROOM');
    var params = queryString.parse(window.location.href)
    var fetchRoomDetails = await axios.post(`${baseURL}/api/room/findroom`,{roomID:params.roomID})
    this.setState({ ...this.state, roomID: fetchRoomDetails.data._id })


    var user = jwtDecode(window.localStorage.getItem("meme_token"))
    const { name, room, topic, roomID } = queryString.parse(window.location.search);
    if (!name || !room) return window.location.href = '/'


    var dbChatHistory = await axios.get(`${baseURL}/api/chat/${room}`)
    this.setState({ ...this.state, name: user.name, room: room, topic: topic, tokenUser: user, chatHistory: dbChatHistory.data })
    axios.post(`${baseURL}/socket/join`, { name: user.name, room, roomID, topic, owner: user._id, pp: user.pp })
      .then(resp => {
      })
      .catch(err => {
        console.log(err)
      })

    ROOM.bind('message', (data) => {
      console.log("accepted  sms checcking  room ... ", data, this.state)
      if (data.roomID == this.state.roomID) {
        if (!this.state.userID) {
          this.setState({ ...this.state, uid: data.sms?.uid, chatHistory: [...this.state.chatHistory, { sms: data.sms, user: data.user }] })
          this.getRoom()
        } else {
          this.setState({ ...this.state, chatHistory: [...this.state.chatHistory, { sms: data.sms }] })
          this.getRoom()
        }
      }
    });
    ROOM.bind('roomUpdate', (data) => {
      if (data.room._id == this.state.roomID) {
        this.setState({ ...this.state, roomDetails: data.room })
      }
    });
  }
  getRoom = () => {
    axios.post(`${baseURL}/api/room/find`, { roomName: this.state.room })
      .then(resp => {
        if (Object.keys(resp.data).length === 0) {
          return
        } else {
          this.setState({ ...this.state, roomDetails: resp.data })
        }
      })
      .catch(err => {
      })
  }

  sendSms = (sms) => {
    axios.post(`${baseURL}/socket/sendMessage`, { message: sms, uid: this.state.tokenUser._id, roomID: this.state.roomID })
      .then(resp => {
        console.log("sendSMS-sendMessage", resp.data)
      })
  }

  render() {
    return (
      <div className='dashboard_container '>
        <div className='dashboard_sidebar'>
          <DashboardSidebar state={this.state} />
        </div>
        <div className='dashboard_main_content'>
          <DashboardMainContent state={this.state} />
        </div>
        <div className='dashboard_chat'>
          <DashboardChat sendSMS={this.sendSms} state={this.state} />
        </div>
      </div>
    )
  }
}

export default Dashboard