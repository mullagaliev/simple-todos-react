import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Meteor} from 'meteor/meteor';
import {withTracker} from 'meteor/react-meteor-data';

import {Tasks} from '../api/tasks.js';

import Task from './Task.js';
import AccountsUIWrapper from './AccountsUIWrapper.js';

// App component - represents the whole app
class App extends Component {

    componentDidMount() {
        console.log('mounted');
    }

    constructor(props) {
        super(props);

        this.state = {
            hideCompleted: false,
        };
        this.removeCompleted = this.removeCompleted.bind(this);
    }

    handleSubmit(event) {
        event.preventDefault();

        // Find the text field via the React ref
        const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

        Meteor.call('tasks.insert', text);

        // Clear form
        ReactDOM.findDOMNode(this.refs.textInput).value = '';
    }

    toggleHideCompleted() {
        this.setState({
            hideCompleted: !this.state.hideCompleted,
        });
    }

    renderTasks() {
        let filteredTasks = this.props.tasks;
        if (this.state.hideCompleted) {
            filteredTasks = filteredTasks.filter(task => !task.checked);
        }
        return filteredTasks.map((task) => {
            const currentUserId = this.props.currentUser && this.props.currentUser._id;
            const showPrivateButton = task.owner === currentUserId;

            return (
                <Task
                    key={task._id}
                    task={task}
                    showPrivateButton={showPrivateButton}
                />
            );
        });
    }

    removeCompleted(event) {
        event.preventDefault();
        if (window.confirm('Are you sure you want to delete all completed tasks?')) {
            Meteor.call('tasks.removeCompleted');
        }
    }

    render() {
        return (
            <div className="container">
                <header>
                    <h1>Todo List ({this.props.completeCount}/{this.props.allCount})</h1>

                    <label className="hide-completed">
                        <input
                            type="checkbox"
                            readOnly
                            checked={this.state.hideCompleted}
                            onClick={this.toggleHideCompleted.bind(this)}
                        />
                        Hide Completed Tasks
                    </label>
                    <button onClick={this.removeCompleted} disabled={!(this.props.completeCount > 0)}>Remove completed tasks
                    </button>

                    <AccountsUIWrapper/>

                    {this.props.currentUser ?
                        <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
                            <input
                                type="text"
                                ref="textInput"
                                placeholder="Type to add new tasks"
                            />
                        </form> : ''
                    }
                </header>

                <ul>
                    {this.renderTasks()}
                </ul>
            </div>
        );
    }
}

export default withTracker(() => {
    Meteor.subscribe('tasks');

    return {
        tasks: Tasks.find({}, {sort: {createdAt: -1}}).fetch(),
        completeCount: Tasks.find({checked: {$eq: true}}).count(),
        allCount: Tasks.find({}).count(),
        currentUser: Meteor.user(),
    };
})(App);
