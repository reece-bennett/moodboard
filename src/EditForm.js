import React from "react";
import PropTypes from "prop-types";
import "./EditForm.css";

export default class EditForm extends React.Component {
  state = {
    description: this.props.image.description,
    sourceUrl: this.props.image.sourceUrl
  };

  handleChange = event => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSubmit = event => {
    const { image, onUpdate } = this.props;

    event.preventDefault();

    let changes = {};
    for (const [key, value] of Object.entries(this.state)) {
      if (this.props.image[key] !== value) {
        changes[key] = value;
      }
    }
    
    if (Object.keys(changes).length !== 0) {
      onUpdate(image._id, changes);
    }
  };

  render() {
    const { onCancel, onDelete } = this.props;
    const { description, sourceUrl } = this.state;

    return (
      <form className="editForm" onSubmit={this.handleSubmit}>
        <h2>Edit Image</h2>
        <label>
          <span>Description:</span>
          <input
            name="description"
            type="text"
            autoComplete="off"
            value={description}
            onChange={this.handleChange}
            required
          />
        </label>
        <label>
          <span>Source URL:</span>
          <input
            name="sourceUrl"
            type="url"
            autoComplete="off"
            value={sourceUrl}
            onChange={this.handleChange}
            required
          />
        </label>
        <div>
          <button type="submit">Submit</button>
          <button type="button" onClick={onCancel}>
            Close
          </button>
          <button type="button" onClick={onDelete} style={{ float: "right" }}>
            Delete
          </button>
        </div>
      </form>
    );
  }
}

EditForm.propTypes = {
  image: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
