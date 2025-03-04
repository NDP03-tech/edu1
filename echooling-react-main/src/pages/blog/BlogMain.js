import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import posts from '../../data/Posts.json';

const BlogMain = () => {
    const itemsPerPage = 5; // Số bài viết mỗi trang
    const [currentPage, setCurrentPage] = useState(0);

    // Tính toán index của bài viết hiển thị
    const offset = currentPage * itemsPerPage;
    const currentPosts = posts.slice(offset, offset + itemsPerPage);
    const pageCount = Math.ceil(posts.length / itemsPerPage);

    // Xử lý khi chuyển trang
    const handlePageClick = ({ selected }) => {
        setCurrentPage(selected);
        window.scrollTo(0, 0);
    };

    return (
        <div className="react-blog-page pb---40 pt---110">
            <div className="container pb---70">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="blog-grid">
                            {currentPosts.map((data, index) => (
                                <div key={index} className="single-blog">
                                    <div className="inner-blog">
                                        <div className="blog-img">
                                            <Link to={`/blog/${data.id}`} className="cate">{data.category}</Link>
                                            <img src={require(`../../assets/images/blog/${data.image}`)} alt={data.title} />
                                        </div>
                                        <div className="blog-content">
                                            <ul className="top-part">
                                                <li>
                                                    <img src={require(`../../assets/images/course/${data.authorImg}`)} alt="user" /> {data.author}
                                                </li>
                                                <li className="date-part">{data.publishedDate}</li>
                                                <li>{data.totalView} views</li>
                                            </ul>
                                            <h3 className="blog-title"><Link to={`/blog/${data.id}`}>{data.title}</Link></h3>
                                            <p className="blog-desc">{data.description}</p>
                                            <Link to={`/blog/${data.id}`} className="blog-btn">Read More</Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Phân trang */}
                        <ReactPaginate
                            previousLabel={"←"}
                            nextLabel={"→"}
                            breakLabel={"..."}
                            pageCount={pageCount}
                            marginPagesDisplayed={2}
                            pageRangeDisplayed={3}
                            onPageChange={handlePageClick}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                            previousClassName={"prev"}
                            nextClassName={"next"}
                            pageClassName={"page-item"}
                            pageLinkClassName={"page-link"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogMain;
