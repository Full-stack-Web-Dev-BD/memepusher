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
    tokenUser: {}
  }
  async componentDidMount() {
    const ROOM = pusher.subscribe('ROOM');

    var user = jwtDecode(window.localStorage.getItem("meme_token"))
    const { name, room, topic } = queryString.parse(window.location.search);
    if (!name || !room) return window.location.href = '/'
    var dbChatHistory = await axios.get(`${baseURL}/api/chat/${room}`)
    this.setState({ ...this.state, name: user.name, room: room, topic: topic, tokenUser: user, chatHistory: dbChatHistory.data })
    axios.post(`${baseURL}/socket/join`, { name: user.name, room, topic, owner: user._id, pp: user.pp })
      .then(resp => {
        console.log('socket/join', resp)
      })
      .catch(err => {
        console.log(err)
      })

    ROOM.bind('message', (data) => {

      var params = queryString.parse(window.location.href)
      axios.get(`${baseURL}/api/room/${params.room}`)
        .then(res => {
          if (data.room == res.data._id) {
            if (!this.state.userID) {
              this.setState({ ...this.state, uid: data.sms?.uid, chatHistory: [...this.state.chatHistory, { sms: data.sms, user: data.user }] })
              this.getRoom()
            } else {
              this.setState({ ...this.state, chatHistory: [...this.state.chatHistory, { sms: data.sms }] })
              this.getRoom()
            }
          }
        })
        .catch(err => {
          console.log(err)
        })
    });
    ROOM.bind('roomUpdate', (data) => {
      var params = queryString.parse(window.location.href)
      axios.get(`${baseURL}/api/room/${params.room}`)
        .then(res => {
          if (data.room == res.data._id) {
            this.setState({ ...this.state, roomDetails: data.room })
            console.log("get from  server room update =======", data)
          }
        })
        .catch(err => {
          console.log(err)
        })
    });
    // ROOM.bind('roundPushBack', (data) => {
    //   console.log("round created ",  data)
    // })
  }
  getRoom = () => {
    axios.post(`${baseURL}/api/room/find`, { roomName: this.state.room })
      .then(resp => {
        console.log("get data roo>>>>>>", resp.data)
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
    axios.post(`${baseURL}/socket/sendMessage`, { message: sms, uid: this.state.tokenUser._id })
      .then(resp => {
        console.log("sendSMS-sendMessage", resp.data)
      })
  }

  render() {
    return (
      <div className='dashboard_container '>
        {/* <button onClick={e => console.log(this.state)}>  log </button> */}
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