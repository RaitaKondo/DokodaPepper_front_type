import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
<div className="container text-center mt-5">
  <h1 className="display-4 text-danger">404 - ページが見つかりません</h1>
  <p className="lead">指定されたURLは存在しません。</p>
  <Link to="/" className="btn btn-primary mt-3">ホームへ戻る</Link>
</div>
  );
};


export default NotFound;
