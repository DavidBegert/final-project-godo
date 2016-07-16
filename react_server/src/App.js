import React, { Component } from 'react';
import EventsPage from './components/EventsPage.js';
import HomePage from './components/HomePage.js';
import $ from 'jquery';

//TODO implement the geolocation option. (commented out below). 
//Also, put in logic if the place entered does not have any events. Show an error message. 

// const geolocation = (
//   canUseDOM && navigator.geolocation || {
//     getCurrentPosition: (success, failure) => {
//       failure( () => { console.log("ERROR ERROR ERROR") });
//       success(() => {console.log("YAY YAY YAY") });
//     },
//   }
// );


var ajaxRequest;
export default class App extends Component {

  constructor() {
    super();
    this.state = {
      homePage: true,
      events: [],
      mapCenter: {lat: 49.2827, lng: -123.1207}
    }
  }

  // TODO - Write logic to render either HomePage or EventsPage, fix the few bugs in the ajax request. (
  //like when they click a city and then click a date after the ajax request has finished... that needs some logic.)
  switchPage() {
    this.setState({homePage: false});
  };

  makeAjaxCall(location, date = "Today") {
    /* 
      geolocation.getCurrentPosition((position) => {
        this.setState({currentPosition: {lat: position.coords.latitude, lng: position.coords.longitude }})
      })
    */

    if (location === undefined) {
      console.log("no location");
      return;
    }

    if (ajaxRequest) {
      var today = new Date();
      var dd = today.getDate();
      var mm = today.getMonth()+1; //January is 0!
      var yyyy = today.getFullYear();
      if(dd<10) {
          dd='0'+dd
      } 
      if(mm<10) {
          mm='0'+mm
      } 
      var today = yyyy+mm+dd+"00-"+yyyy+mm+dd+"00";
      if (date === today) { //if they clicked on todays date return since that request is already going through
        console.log("THIS HAS ALREADY BEEN REQUESTED NO WORRIES DAVE");
        return;
      }
      ajaxRequest.abort();
      console.log("ajaxRequest abortted");
    }
    console.log("CALL MADE");
    console.log(date);
    var lat = parseFloat(location.split(', ')[0]);
    var lng = parseFloat(location.split(', ')[1]);
    var mapCenter = {lat: lat, lng: lng};
    this.setState({mapCenter: mapCenter});
    ajaxRequest = $.ajax({
      url: 'http://api.eventful.com/json/events/search',
      dataType: 'jsonp',
      data: {
        location: location,
        app_key: 'pVnn7M9Sk54FkgBf', //FFmssWtvRRfc9VF7
        page_size: 100,
        date: date,
        within: 1,
        change_multi_day_start: true,
        include: 'categories',
        ex_category: 'learning_education,schools_alumni,conference,community,family_fun_kids,clubs_associations',
        category: 'comedy,food,music,festivals_parades,movies_film,fundraisers,art,support,holiday,books,attractions,business,singles_social,outdoors_recreation,performing_arts,animals,politics_activism,sales,science,religion_spirituality,sports,technology,other',
      },
      success: function(response) {
        var results = response.events.event;
        console.log(results);
        this.setState({events: results});
        ajaxRequest = null;
      }.bind(this)
    });
  };

  // handleMapMarkerClick(marker) {
  //   this.state.selectedEvents.unshift(marker);
  //   this.setState(this.state);
  // }

  render() {
    if (this.state.homePage) {
      return (
        <HomePage makeCall={this.makeAjaxCall.bind(this)} switchPage={this.switchPage.bind(this)}/>
      );
    } else {
      return (
        <EventsPage events={this.state.events} currentPosition={this.state.mapCenter} />
      );
    }
  }


}