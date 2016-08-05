var React = require ( 'react' );
var ReactDOM = require('react-dom');

var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Navigation = ReactRouter.Navigation;
var History = ReactRouter.History;

var createBrowserHistory = require('history/lib/createBrowserHistory');

var h = require('./helpers');

// Firebase
var Rebase = require('re-base');
var base = Rebase.createClass('https://luminous-heat-722.firebaseio.com/');

var Catalyst = require('react-catalyst');


/*
  APP
*/
var App = React.createClass({

  mixins : [Catalyst.LinkedStateMixin],
  getInitialState : function () {
    return {
      fishes : {},
      order : {}
    };
  },

  componentDidMount : function () {
    console.log("Loaded" + this.props.params.storeId );
    base.syncState(this.props.params.storeId + '/fishes', {
      context : this,
      state : 'fishes'
    });

    var localStorageRef = localStorage.getItem('order' + this.props.params.storeId );

    if(localStorageRef) {
      this.setState({
        order : JSON.parse( localStorageRef)
      });
    }
  },

  componentWillUpdate : function (nextProps, nextState) {

    localStorage.setItem( 'order' + this.props.params.storeId, JSON.stringify( nextState.order ) );
  },

  addToOrder : function (key) {
    this.state.order[key] = this.state.order[key] + 1 || 1;
    this.setState({ order : this.state.order });
  },

  addFish : function (fish) {
    var timestamp = (new Date()).getTime();
    // update the state
    this.state.fishes['fish-' + timestamp] = fish;
    this.setState({fishes : this.state.fishes});

  },

  loadSamples : function() {
    this.setState({
      fishes : require('./sample-fishes')
    });
  },


  renderFish : function (key) {
    return <Fish key={key} index={key} details={this.state.fishes[key] }  addToOrder={this.addToOrder}/>;
  },

  render : function () {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header  tagline="Fresh Seafood Market" />
          <ul className="list-of-fishes">
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order order={this.state.order} fishes={this.state.fishes} />
        <Inventory
           fishes={this.state.fishes}
           addFish={this.addFish}
           linkState={this.linkState}
           loadSamples={this.loadSamples}/>
      </div>
    );
  }

});


/*
 Fish
*/
var Fish = React.createClass({

  onButtonClick : function () {
    console.log("going to add the fish: ", this.props.index);
    this.props.addToOrder(this.props.index);
  },

  render : function () {

    var details = this.props.details;
    var isAvailable = (details.status === 'available' ? true : false);
    var buttonText = (isAvailable ? 'Add to Order': 'Sold out');

    return (
      <li className="menu-fish">
        <img alt="" src={this.props.details.image} />
        <h3 className="fish-name">
          { details.name }
          <span className="price">{h.formatPrice( details.price ) }</span>
        </h3>
        <p>{details.desc}</p>
        <button disabled={!isAvailable} onClick={this.onButtonClick}>{buttonText}</button>
      </li>
    );
  }

});


/*
  Add Fish Form
*/

var AddFishForm = React.createClass({

  createFish : function (event) {
    
    event.preventDefault();
    console.log("grr");

    var fish = {
      name : this.refs.name.value,
      price : this.refs.price.value,
      status : this.refs.status.value,
      desc : this.refs.desc.value,
      image : this.refs.image.value
    };

    this.props.addFish(fish);
  },

  render : function () {
    return (
      <form  className="fish-edit" onSubmit={this.createFish} >
        <input ref="name" placeholder="Fish Name" type="text" /> 
        <input ref="price" placeholder="Fish Price" type="text" /> 
        <select ref="status">
          <option value="available">Fresh!</option>
          <option value="unavailable">Sold Out!</option>
        </select>
        <textarea ref="desc" placeholder="Desc"></textarea>
        <input ref="image" placeholder="URL to Image" type="text" /> 
        <button type="submit">+ Add Item</button>
      </form>
    );
  }

});

/*

  Header

*/
var Header = React.createClass({

  render : function () {
    return (
      <header className="top">
        <h1>Catch

          <span className="ofThe">
            <span className="of">of</span>
            <span className="the">the</span>
          </span>
        Day</h1>
        <h3 className="tagline"><span>{this.props.tagline}</span></h3>
      </header>
    );
    
  }

});


/*

  Order

*/
var Order = React.createClass({

  renderOrder : function (key) {

    var fish = this.props.fishes[key];
    var count = this.props.order[key];
    
    if(!fish){
      return <li key={key}> Sorry, fish no longer available! </li>;
    }

    return (
      <li key={key}>
        { count }lbs
        { fish.name }
        <span className="price">{ h.formatPrice( count * fish.price ) }</span>
      </li>
    );

  },

  render : function () {
    var orderIds = Object.keys(this.props.order);
    var total = orderIds.reduce((prevTotal, key)=> {
      var fish = this.props.fishes[key];
      var count = this.props.order[key];
      var isAvailable = fish && fish.status === 'available';

      if(fish && isAvailable){
        return prevTotal + (count * parseInt(fish.price) || 0);
      }

      return prevTotal;
    }, 0);

    return (
      <div className="order-wrap">
        <h2 className="order-title">Your Order</h2>
        <ul className="order">
          { orderIds.map( this.renderOrder ) }
          <li className="total">
            <strong>Total:</strong>
            { h.formatPrice( total ) }
          </li>

        </ul>
      </div>
    );

  }

});


/*

  Inventory

*/
var Inventory = React.createClass({

  renderInventory : function (key) {
    
    var linkState = this.props.linkState;
    
    return(
      <div className="fish-edit" key={key}>
        <input name="" type="text" valueLink={ linkState('fishes.'+ key +'.name')} />
        <input name="" type="text" valueLink={ linkState('fishes.'+ key +'.price')} />
        <select id="" name="" valueLink={linkState('fishes.'+ key + '.status')} >
          <option value="unavailable">Sold Out</option>
          <option value="available">Freash!</option>
        </select>

        <textarea valueLink={linkState('fishes.' + key + '.desc')}></textarea>
        <input name="" type="text" valueLink={ linkState('fishes.'+ key +'.image')} />
        <button>Remove Fish</button>
      </div>
    );
  },

  render : function () {
    return (
      <div>
        <h2>Inventory</h2>
        {Object.keys( this.props.fishes ).map( this.renderInventory ) }
        <AddFishForm {...this.props} />
        <button onClick={this.props.loadSamples}>Load Samples</button>
      </div>
    )
  }

});

                               
var StorePicker = React.createClass({

  mixins: [History],

  goToStore : function (event) {
    event.preventDefault();

    var storeId = this.refs.storeId.value;
    this.history.pushState(null, '/store/' + storeId);
  },

  render : function () {
    return (
        <form className="store-selector" onSubmit={this.goToStore}>
        <h2>Please Enter A Store</h2>
        <input type="text" ref="storeId" defaultValue={ h.getFunName() } required />
        <input type="submit" />
      </form>
    );
  }

});


/*
  Not Found
*/

var NotFound = React.createClass({

  render : function() {
    return <h1>Not Found!</h1>
  }

});

/*
  Routes
*/

var routes = (
    <Router history={createBrowserHistory()} >
    <Route path="/" component={StorePicker} />
    <Route path="/store/:storeId" component={App} />
    <Route path="*" component={NotFound} />
  </Router>
)

ReactDOM.render( routes, document.querySelector('#main'));
