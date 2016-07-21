import React, { Component } from 'react';
import classnames from 'classnames';
import EventsPage from './components/EventsPage.js';
import HomePage from './components/HomePage.js';
import $ from 'jquery';
import { default as canUseDOM } from "can-use-dom";

//TODO - put in logic if the place entered does not have any events. Show an error message. 

var currentAjaxRequest = {};

const geolocation = (
  canUseDOM && navigator.geolocation || {
    getCurrentPosition: (success, failure) => {
      failure( () => { console.log("ERROR ERROR ERROR") });
      success(() => {console.log("YAY YAY YAY") });
    },
  }
);

export default class App extends Component {

  constructor() {
    super();
    this.state = {
      homePage: true,
      events: [],
      date: new Date().toISOString().slice(0,10),
      location: null,
      showLoadingGif: false,
    }
  }

  convertDateForAjax(date) {
    date = date.split('-').join('') + '00'
    return date + "-" + date;
  }

  // TODO - Write logic to render either HomePage or EventsPage, fix the few bugs in the ajax request. (
  //like when they click a city and then click a date after the ajax request has finished... that needs some logic.)
  switchPage() {
    this.setState({homePage: false});
  };

  handleGeolocationPress() {
    //populate the place form with closest place
    this.setState({showLoadingGif: true});
    geolocation.getCurrentPosition((position) => {
      // console.log(position);
      var locationObject= {lat: parseFloat(position.coords.latitude), lng: parseFloat(position.coords.longitude) }
      this.handleNewParams(locationObject, this.state.date)
      this.setState({showLoadingGif: false});
    });
  }

  handleNewParams(location, date) {
    if (this.state.location !== location || this.state.date !== date) {
      this.setState({location, date});
      this.makeAjaxCall(location, date);
    }
  }

  makeAjaxCall(location = this.state.location, date = this.state.date, page_number = 1) {
    date = this.convertDateForAjax(date);
    if (!location) {
      return;
    }

    if (currentAjaxRequest.promise) {

      if (date === currentAjaxRequest.settings.date && location === currentAjaxRequest.settings.location) { 
        return;
      }
      currentAjaxRequest.promise.abort();
    }
    console.log("call made!");
    currentAjaxRequest.settings = {date, location};
    currentAjaxRequest.promise = $.ajax({
      url: 'http://api.eventful.com/json/events/search',
      dataType: 'jsonp',
      data: {
        location: location.lat + ',' + location.lng,
        app_key: 'pVnn7M9Sk54FkgBf', //FFmssWtvRRfc9VF7
        page_size: 100,
        page_number: page_number,
        date: date,
        within: 10,
        unit: 'km',
        change_multi_day_start: true,
        include: 'categories,tickets',
        ex_category: 'learning_education,schools_alumni,conference,community,clubs_associations',
        sort_order: 'relevance'
      },
      success: function(response) {
        var results = response.events.event;
        // Filter out events with no description. They're usually crap.
        var goodResults = results.filter( function(event) {
          return event.description;
          });
        this.setState({ events: goodResults });
        currentAjaxRequest = {};
      }.bind(this),
      error: function(xhr, textStatus, errorThrown) {
        console.log(xhr);
        console.log(textStatus);
        console.log(errorThrown);
      }
    });
  }

  render() {
    if (this.state.homePage) {
      return (
        <HomePage 
          switchPage={this.switchPage.bind(this)}
          date={this.state.date}
          handleGeolocationPress={this.handleGeolocationPress.bind(this)}
          location={this.state.location}
          showLoadingGif={this.state.showLoadingGif}
          handleNewParams={this.handleNewParams.bind(this)}
        />
      );
    } else {
      return (
        <EventsPage
          events={this.state.events}
          date={this.state.date}
          handleGeolocationPress={this.handleGeolocationPress.bind(this)}
          handleNewParams={this.handleNewParams.bind(this)}
          location={this.state.location}
        />
      );
    }
  }


}