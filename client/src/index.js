import React from 'react';
import ReactDOM from 'react-dom';

const SERVER_HOST = 'http://' + window.location.hostname + ':3002';


var $ = require("./jquery-2.2.3.min.js");



class ItemList extends React.Component {

  constructor(props) {
    super(props);
    this.handleTagClick = this.handleTagClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      items: [],
      tags: [],
      tips: ''
    };
  }

  componentDidMount() {
    this.search();
    this.initTags();
  }

  handleSubmit(e) {
    e.preventDefault();

    this.search(this.refs.keywords)
    return;

  }

  handleTagClick(e) {
    e.preventDefault();
    console.log($(e.target).html());
    this.search({
      tag: $(e.target).html()
    })
    return;

  }

  initTags() {
    $.ajax({
      url: SERVER_HOST + '/tags',
      dataType: 'jsonp',
      cache: false,
      success: function(tags) {
        this.setState({
          tags: tags
        });
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }


  search(options = {}) {

    this.setState({
      tips: 'flashing...'
    });

    $.extend({
      tag: ''
    }, options);
    // this.setState({
    //   items: []
    // });
    $.ajax({
      url: SERVER_HOST + '/search',
      dataType: 'jsonp',
      data: options,
      cache: false,
      beforeSend: function() {

      },
      success: function(items) {
        this.setState({
          items: items
        });

        this.setState({
          tips: ''
        });


      }.bind(this),
      error: function(xhr, status, err) {

        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  }


  render() {

    var _this = this;


    var tagNodes = this.state.tags.map(function(tag) {

      return (

        <a className = "tag"  onClick = {_this.handleTagClick}>{tag.title}</a>

      );
    });




    var itemNodes = this.state.items.map(function(item) {



     var itemTagNodes = item.categories.map(function(tagTitle) {

      return (

        <a className = "tag"  onClick = {_this.handleTagClick}>{tagTitle}</a>

      );
    });



      return (
        <div className="article"> 
            <div className="article-inner">
            <header className="article-header">
                
               <div className="article-header-left">
               <h1><a className="article-title" href={item.link} target="_blank">{item.title}</a></h1>
                     <div className="article-meta">[{item.feedTitle}] {item.pubDate}</div>
                </div>
                <div className="article-header-right">
                  <h1><a className="article-title" href={item.link} target="_blank"> > </a></h1>
                    
                    </div>
            </header>
            <div className="article-entry">
                <div dangerouslySetInnerHTML={{__html:item.description}}></div>
            </div>
        
               <footer className="article-footer">
                    <div className="tags">{itemTagNodes}</div>
               </footer>
            </div>
      </div>
      );
    });



    return (
      <div className="itemList">
      <div id="header">
    <div className="tags">
         <a className="tag filter-all"  onClick ={this.handleTagClick} >all</a>
         {tagNodes} <span  className="tips">{this.state.tips}</span></div>
         
      </div>
     
        {itemNodes}
    
      </div>
    );
  }
}

ReactDOM.render(<ItemList />, document.getElementById('react'));