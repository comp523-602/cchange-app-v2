/** @namespace components/Post */

// Import dependencies
import React, { Component } from 'react';
import Requests from './../modules/Requests';
import Authentication from './../modules/Authentication';
import Format from './../modules/Format';
import { Link } from 'react-router-dom';
import $ from 'jquery';

class Post extends Component {

  constructor(props) {
  	super(props)
    this.state = {
      'editing': false,
      'donations': this.props.post.donations.length,
      'buttonText': "Edit Post",
      'caption': this.props.post.caption,
	  'donateText': "Donate 5¢"
  	};
    this.editPost = this.editPost.bind(this, this.props.post.guid);
    this.donate = this.donate.bind(this);
  }

    /**
     * Temporary donate function
     * @memberof components/Post#
     */
     donate(event) {
		 this.setState({'donateText': "..."});
       var self = this;
       Requests.makeRequest('donation.create', {
         'post': self.props.post.guid,
         'amount': 5,
       }, function (error, body) {
         if(error){
           this.setState({'donateText': "Insufficient funds"});
         }
         else{
            var donation = body.donation;
            var post = body.post;
            if (!donation || !post) return;
            self.setState({
				'donateText': "Success!",
                'donations': self.state.donations + 1,
            });
         }
		 window.setTimeout(function () {
			 self.setState({
				 'donateText': "Donate 5¢"
			 })
		 }, 2000);
       })

     }

    /**
     * Renders a post with its image, caption, the campaign's name, and the user who posted it
     * @memberof components/Post#
     */
     render() {
         return(
            <div className="item post row">

				<Link to={"/post/" + this.props.post.guid}>
                	<img src={this.props.post.image} alt={this.props.post.caption} />
                </Link>

                <div className="inside">
                    <Link to={"/campaign/" + this.props.post.campaign} >
                    	<h3 className="campaignText">Campaign: {this.props.post.campaignName}</h3>
                    </Link>

                    <Link to={"/charity/" + this.props.post.charity} >
                    	<h3 className={"charityText_" + this.props.post.guid} >Charity: {this.props.post.charityName}</h3>
                    </Link>

                    {!this.state.editing
                        ? <h3 className={"postText_" + this.props.post.guid}>Caption: {this.state.caption}</h3>
                        : <textarea id="textarea">{this.state.caption}</textarea> }

                    <Link to={"/user/" + this.props.post.user} >
                    	<h3 className={"userText_" + this.props.post.guid}>User: {this.props.post.userName}</h3>
                    </Link>


					<div className="time">
						<h3>{Format.time(this.props.post.dateCreated)}</h3>
					</div>
					<h3>{this.state.donations} donations</h3>

					<div className="buttons">
	                    {Authentication.status() === Authentication.USER
	                    	? <div id="donateDiv" onClick={this.donate}><button>{this.state.donateText}</button></div>
	                        : null}
						{ Authentication.getUser() && Authentication.getUser().guid === this.props.post.user
		                    ? <button id={"editPost_" + this.props.post.guid} onClick={()=> this.editPost(this.props.post.guid)}>{this.state.buttonText}</button>
		                    : null }
					</div>
                </div>
				<div className="clear"></div>

            </div>
         )
     };

     editPost(postguid) {
          var self = this;
          var editPostString;

          if(this.state.editing) {
              //console.log("editing true");
              editPostString = $("#textarea").val();
              self.setState({
                editing: false,
                buttonText: "Edit Post",
                caption: editPostString
              }, function() {
               // console.log(self.state.editing + " " + this.state.buttonText);
              })
              Requests.makeRequest('post.edit', {
               'post': postguid,
               'caption': editPostString
              }, (error, body) => {
                //returns post object
              });

          }

          else {
            this.setState({
              editing: true,
              buttonText: "Done"
              }, function() {
              //console.log(this.state.editing + " " + this.state.buttonText);
              })
            }
      }
}
export default Post;
