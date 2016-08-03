var React = require ( 'react' );
var ReactDOM = require('react-dom');

var ReactRouter = require('react-router');
var Router = ReactRouter.Router;
var Route = ReactRouter.Route;
var Navigation = ReactRouter.Navigation;
var History = ReactRouter.History;

var createBrowserHistory = require('history/lib/createBrowserHistory');

var h = require('./helpers');

/*
  APP
*/


var App = React.createClass({

  getInitialState : function () {
    return {
      fishes : {},
      order : {}
    };
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

  render : function () {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header  tagline="Fresh Seafood Market" />
        </div>
        <Order />
        <Inventory addFish={this.addFish} loadSamples={this.loadSamples}/>
      </div>
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

  render : function () {
    return (
        <p>Order</p>
    );

  }

});


/*

  Inventory

*/
var Inventory = React.createClass({

  render : function () {
    return (
      <div>
        <h2>Inventory</h2>
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
