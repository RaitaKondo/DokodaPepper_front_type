import React from "react";

const NewPost: React.FC = () => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100">
      <h1>New Post</h1>
      <form className="w-50">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input type="text" className="form-control" id="title" required />
        </div>
        <div className="mb-3">
          <label htmlFor="content" className="form-label">Content</label>
          <textarea className="form-control" id="content" rows={5} required></textarea>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}

export default NewPost;