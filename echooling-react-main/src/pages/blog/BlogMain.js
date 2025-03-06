import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import posts from '../../data/Posts.json';
import './BlogMain.css'; // Import CSS file

const BlogMain = () => {
    const itemsPerPage = 4; // Số bài viết mỗi trang
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
        <div className="react-blog-page pb-40 pt-110">
            <div className="container pb-70">
                <div className="row">
                    {currentPosts.map((data, index) => (
                        <div key={index} className="col-lg-6 mb-4">
                            <div className="single-blog h-100 shadow-effect"> {/* Thêm lớp shadow-effect */}
                                <div className="inner-blog d-flex flex-column h-100">
                                    <div className="blog-img">
                                        <Link to={`/blog/${data.id}`} className="cate">{data.category}</Link>
                                        <img src={require(`../../assets/images/blog/${data.image}`)} alt={data.title} className="img-fluid" />
                                    </div>
                                    <div className="blog-content mt-auto p-3 rounded shadow-sm">
    <h3 className="blog-title text-center mb-3">
        <Link to={`/blog/${data.id}`} className="text-decoration-none text-dark">{data.title}</Link>
    </h3>
    <p className="blog-desc mb-3">{data.description}</p>
    
    {/* Nút Read More */}
    <div className="d-flex justify-content-center mb-3">
        <Link to={`/blog/${data.id}`} className="blog-btn btn btn-primary">Read More</Link>
    </div>

    <ul className="top-part list-unstyled d-flex justify-content-between align-items-center">
        <li className="me-3">
            <small className="fw-bold fs-5">Tác giả: {data.author}</small> {/* Bôi đậm và làm to chữ tác giả */}
        </li>
        <li className="date-part">
            <small className="fw-bold fs-5">{data.publishedDate}</small> {/* Bôi đậm và làm to chữ ngày */}
        </li>
    </ul>
</div>
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
                    containerClassName={"pagination justify-content-center"}
                    activeClassName={"active"}
                    previousClassName={"page-item"}
                    nextClassName={"page-item"}
                    pageClassName={"page-item"}
                    pageLinkClassName={"page-link"}
                    previousLinkClassName={"page-link"}
                    nextLinkClassName={"page-link"}
                />
            </div>
        </div>
    );
};

export default BlogMain;