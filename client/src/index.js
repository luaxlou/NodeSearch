import React from 'react';
import ReactDOM from 'react-dom';
var $ = require("./jquery-2.2.3.min.js");


class Item extends React.Component {
  render() {
    return (
      <div className="item"> 
          <h3><a href={this.props.link} target="_blank">{this.props.item.title}</a></h3>
          <i>{this.props.item.feedTitle} {this.props.item.pubDate}</i>
          <div>{this.props.item.description}</div>
      </div>
    );
  }
}

class ItemList extends React.Component {

 constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {items: []};
  }
  
    componentDidMount() {
      this.search('node');
  }

  handleSubmit(e)
  { 
    e.preventDefault();
    console.log(this);
     this.search(this.refs.keywords)
    return;
 
  }


  search(){
      $.ajax({
      url:  this.props.url,
      dataType: 'jsonp',
      cache: false,
      success: function(items) {
        this.setState({items: items});
       }.bind(this),
      error: function(xhr, status, err) {
       console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }


	render() {

    var itemNodes = this.state.items.map(function (item) {
      return (
        <Item item={item}>
        </Item>
      );
    });
    return ( 
      <div className="itemList">
         <form className="commentForm" onSubmit={this.handleSubmit}>
            <input type="text" placeholder="node" ref="keywords"/> 
        <input type="submit" value="search" />
      </form> 
        {itemNodes}
      </div>
    );
  }
}

ReactDOM.render(<ItemList url="http://localhost:3002/" />, document.getElementById('react'));