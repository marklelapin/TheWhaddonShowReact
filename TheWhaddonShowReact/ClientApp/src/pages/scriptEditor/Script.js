import React, { Component } from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Scene from './components/Scene';

function Script() {

    return (

        <Scene />

    )

//Old Chat Code
  //render() {
  //  const { mobileState } = this.props;
  //  return (
  //    <div className={`chat-page-wrapper ${s.chatPage} ${mobileState === MobileChatStates.LIST ? 'list-state' : ''} ${mobileState === MobileChatStates.CHAT ? 'chat-state' : ''} ${mobileState === MobileChatStates.INFO ? 'info-state' : ''}`}>
  //      <ChatList />
  //      <ChatDialog />
  //      <ChatInfo />
  //    </div>
  //  )
  //}
}

export default Script