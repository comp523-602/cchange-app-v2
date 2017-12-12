/** @namespace views/CharityView */

// Import dependencies
import React, { Component } from 'react';
import Requests from './../modules/Requests';
import { Link } from 'react-router-dom';
import Authentication from './../modules/Authentication';
import FormConfigs from './../modules/FormConfigs';
import Form from './../components/Form';
import $ from 'jquery';
import 'react-tabs/style/react-tabs.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import List from './../components/List';

class CharityView extends Component {

	/**
	 * Creates initial state with null values
	 * @memberof views/CharityView#
	 */
	constructor(props) {
		super(props)
		this.state = {
			'user': Authentication.getUser(),
		};
		this.follow = this.follow.bind(this);
		this.unfollow = this.unfollow.bind(this);
	}

	/**
	 * Gets charity object, updates state with charity object
	 * @memberof views/CharityView#
	 */
	componentWillMount (newProps) {

		// Get charity GUID from props
		var charityGUID = null;
		if (newProps) charityGUID = newProps.match.params.guid;
		else charityGUID = this.props.match.params.guid;

		// Get charity from server
		Requests.makeRequest('list.single', {
			'type': "charity",
			'guid': charityGUID
		}, (error, body) => {

			// Get charity from response
			var charity = body.object;
			if (!charity) return;

			// Add charity to state
			this.setState({
				'charity': charity,
			})
		})
	}

	componentWillReceiveProps(newProps) {
		this.componentWillMount(newProps);
	}

	/**
	 * Follows charity for User
	 * @memberof views/CharityView#
	 */
	 follow() {
		 Requests.makeRequest('user.followCharity', {
			 	'charity': this.props.match.params.guid,
 			}, (error, body) => {
				var user = body.user;
				if (!user) return;
				this.setState({
					'user': user
				});
			})
	 }

	 /**
 	 * Unfollows charity for user
 	 * @memberof views/CharityView#
 	 */
	 unfollow() {
		 Requests.makeRequest('user.unfollowCharity', {
			 	'charity': this.props.match.params.guid,
 			}, (error, body) => {
				var user = body.user;
				if (!user) return;
				this.setState({
					'user': user
				});
			})
	 }

	/**
	 * Renders view
	 * @memberof views/CharityView#
	 */
	render() {
		return (
			<div>
				<div className="heading">
					<div className="container">
						{ this.state.charity
							? (
								<div className="profileHeading">
									{ this.state.charity.logo
										? <img src={this.state.charity.logo} alt={this.state.charity.name} />
										: null}
									<h1>{this.state.charity.name}</h1>
									<h2>{this.state.charity.description}</h2>
								</div>
							)
							: <div className="loading">Loading...</div> }
						{ this.state.user && this.state.user.charity === this.props.match.params.guid
							&& this.state.charity
							? <div className="editLinks">
									<Link to="/campaignCreate">Create a campaign</Link>
									<Link to="/updateCreate">Create an update</Link>
									<Link to={"/charityEdit/"+this.state.charity.guid}>Edit charity</Link>
								</div>
							: null }
						{ this.state.charity && this.state.user && Authentication.status() === Authentication.USER
							? <div className="user actions">
									{ Authentication.getUser().followingCharities.indexOf(this.props.match.params.guid) > -1
										? <button onClick={this.unfollow}>Unfollow</button>
										: <button onClick={this.follow}>Follow</button> }
									<Form form={FormConfigs.donation(this.state.charity.name, 'charity', this.props.match.params.guid)} onSuccess={this.onDonate} />
								</div>
							: null}
					</div>
				</div>
				<div className="container row">
					<Tabs>
						<TabList>
							<Tab>Campaigns</Tab>
							<Tab>Updates</Tab>
							<Tab>Donations</Tab>
						</TabList>
						<TabPanel>
							<List config={{address: 'list.type', params: {type: "campaign", charity: this.props.match.params.guid}}} />
						</TabPanel>
						<TabPanel>
							<List config={{address: 'list.type', params: {type: "update", charity: this.props.match.params.guid}}} />
						</TabPanel>
						<TabPanel>
							<List config={{address: 'list.type', params: {type: "donation", charity: this.props.match.params.guid}}} />
						</TabPanel>
					</Tabs>
				</div>
			</div>
		)
  	}

		/**
		* Passed to components/Form to be exeuted on successful request
		* @memberof views/CharityView#
		*/
		onDonate (response) {
			 var amount = response.donation.amount;
			 $(".donation").append("<p>You just donated " + amount + "!</p>");
		}
}

export default CharityView;
