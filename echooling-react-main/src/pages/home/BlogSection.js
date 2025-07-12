import React, { useEffect, useState } from 'react';
import SectionTitle from '../../components/SectionTitle';
import SinglePost from '../../components/Blog/SinglePost';
import axios from 'axios'; // nhớ cài nếu chưa: npm install axios

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/blog/'); // Đảm bảo đúng endpoint
                setPosts(res.data);
            } catch (err) {
                console.error('Lỗi khi lấy bài viết:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="react-blog__area blog__area pt---120 pb---120 graybg-home">
            <div className="container blog__width">
                <SectionTitle Title="News and Blogs" />

                {loading ? (
                    <p>Đang tải bài viết...</p>
                ) : (
                    <div className="row">
  {posts.slice(0, 4).map((data, index) => (
    <div
      key={index}
      className="col-xxl-3 col-xl-3 col-lg-3 col-md-6 col-sm-12 col-12"
    >
      <div className="h-full flex flex-col">
        <SinglePost
          blogID={data._id}
          blogImage={data.image}
          blogTitle={data.title}
          blogAuthor={data.author}
          blogPublishedDate={data.publishedDate}
        />
      </div>
    </div>
  ))}
</div>

                )}
            </div>
        </div>
    );
};

export default Blog;
