import React, {Component} from 'react';
import {Meteor} from 'meteor/meteor';
import classnames from 'classnames';

import {Tasks} from '../api/tasks.js';
import camelize from '../helpers/camelize';

// Task component - represents a single todo item
export default class Task extends Component {
    constructor(props) {
        super(props);
        this.setCamelize = this.setCamelize.bind(this);
        this.updateTaskText = this.updateTaskText.bind(this);
    }

    componentDidMount() {
        console.log('Task mounted');
    }

    componentDidUpdate(prevProps, prevState) {
        console.log({
            state: this.state,
            props: this.props
        });
    }

    toggleChecked() {
        // Set the checked property to the opposite of its current value
        Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
    }

    deleteThisTask() {
        Meteor.call('tasks.remove', this.props.task._id);
    }

    togglePrivate() {
        Meteor.call('tasks.setPrivate', this.props.task._id, !this.props.task.private);
    }

    setCamelize(event) {
        Meteor.call('tasks.nameCamelize', this.props.task._id);
    }

    updateTaskText(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
        const taskId = this.props.task._id;

        if (this.props.task.text !== value) {
            Meteor.call('tasks.nameChange', this.props.task._id, value);
        }

    }

    render() {
        // Give tasks a different className when they are checked off,
        // so that we can style them nicely in CSS
        const taskClassName = classnames({
            checked: this.props.task.checked,
            private: this.props.task.private,
        });

        return (
            <li className={taskClassName}>
                <button className="delete" onClick={this.deleteThisTask.bind(this)}>
                    &times;
                </button>

                <input
                    type="checkbox"
                    readOnly
                    checked={!!this.props.task.checked}
                    onClick={this.toggleChecked.bind(this)}
                />

                {this.props.showPrivateButton ? (
                    <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
                        {this.props.task.private ? 'Private' : 'Public'}
                    </button>
                ) : ''}
                <button onClick={this.setCamelize} disabled={this.props.task.text === camelize(this.props.task.text)}>
                    Camelize name
                </button>
                <span className="text">
                     <strong>{this.props.task.username}</strong>:
                     <input type="text" value={this.props.task.text}
                           onChange={this.updateTaskText}/>
                </span>
            </li>
        );
    }
}
