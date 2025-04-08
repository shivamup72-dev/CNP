import React, { useState } from "react";
import { Container, Card, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa"; // Import left arrow icon

const colors = {
  WHITE: "#fff",
  LIGHT_GRAY: "rgba(236, 236, 236, 0.2)",
  GRAY: "rgba(235, 235, 235, 1)",
  DARK_GRAY: "#717171",
  primary_black: "#2D3548",
  primary_blue: "#1463D8",
  backgroundColor: "#FFF8E1",
  btncolor: "#4165E8",
};

const dummyPosts = [
  {
    id: 1,
    title: "New Policies Announcement",
    content: "The government has introduced new policies for economic growth.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0sCSNq1Leueb3UMTJ1dNwwNqk7gRmeCkUn6C7JoVlgd7pewsg4I8ckmUFedWxsEe6Cxs&usqp=CAU",
    underReview: true,
    reviewed: false,
  },
  {
    id: 2,
    title: "Healthcare Improvements",
    content: "New hospitals are being built to improve healthcare facilities.",
    image:
      "https://thestempedia.com/wp-content/uploads/2023/06/New-national-education-policy-2020.png",
    underReview: false,
    reviewed: true,
  },

  {
    id: 3,
    title: "New Policies Announcement",
    content: "The government has introduced new policies for economic growth.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0sCSNq1Leueb3UMTJ1dNwwNqk7gRmeCkUn6C7JoVlgd7pewsg4I8ckmUFedWxsEe6Cxs&usqp=CAU",
    underReview: true,
    reviewed: false,
  },
  {
    id: 4,
    title: "Healthcare Improvements",
    content: "New hospitals are being built to improve healthcare facilities.",
    image:
      "https://thestempedia.com/wp-content/uploads/2023/06/New-national-education-policy-2020.png",
    underReview: false,
    reviewed: true,
  },

  {
    id: 5,
    title: "New Policies Announcement",
    content: "The government has introduced new policies for economic growth.",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0sCSNq1Leueb3UMTJ1dNwwNqk7gRmeCkUn6C7JoVlgd7pewsg4I8ckmUFedWxsEe6Cxs&usqp=CAU",
    underReview: true,
    reviewed: false,
  },
  {
    id: 6,
    title: "Healthcare Improvements",
    content: "New hospitals are being built to improve healthcare facilities.",
    image:
      "https://thestempedia.com/wp-content/uploads/2023/06/New-national-education-policy-2020.png",
    underReview: false,
    reviewed: true,
  },

  {
    id: 7,
    title: "Healthcare Improvements",
    content: "New hospitals are being built to improve healthcare facilities.",
    image:
      "https://thestempedia.com/wp-content/uploads/2023/06/New-national-education-policy-2020.png",
    underReview: false,
    reviewed: true,
  },
];

const Posts = () => {
  const [posts, setPosts] = useState(dummyPosts);
  const [showModal, setShowModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const navigate = useNavigate();

  const handleDelete = (id) => {
    setPosts(posts.filter((post) => post.id !== id));
  };

  const handleFlag = (post) => {
    setSelectedPost(post);
    setShowModal(true);
  };

  const confirmFlag = () => {
    if (!selectedPost) return; // Prevents errors if no post is selected
    setPosts(posts.filter((post) => post.id !== selectedPost.id));
    setShowModal(false);
    setSelectedPost(null); // Reset selected post
  };

  return (
    <Container
      fluid
      style={{
        backgroundColor: colors.backgroundColor,
        minHeight: "100vh",
        padding: "20px",
        paddingBottom: "50px",
      }}
    >
      <div
        style={{
          // border: "3px solid red",
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {/* Circular Back Button */}
        <div
          style={{
            // border: "2px solid green",
            width: "3%",
          }}
        >
          <Button
            onClick={() => navigate("/dashboard")}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              backgroundColor: colors.WHITE,
              border: "1px solid " + colors.GRAY,
              color: colors.DARK_GRAY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
              // border: "3px solid green",
            }}
          >
            <FaArrowLeft />
          </Button>
        </div>

        <div
          style={{
            // border: "3px solid green",
            width: "94%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              color: colors.primary_black,
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Manage Posts
          </h2>
        </div>

        <div
          style={{
            // border: "2px solid green",
            width: "3%",
          }}
        ></div>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",

          // border: "2px solid green",
        }}
      >
        {posts.map((post) => (
          <Card
            key={post.id}
            style={{
              width: "18rem",
              backgroundColor: colors.LIGHT_GRAY,
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              marginBottom: "15px",
            }}
          >
            <Card.Img
              variant="top"
              src={post.image}
              alt={post.title}
              style={{ height: "39%" }}
            />
            <Card.Body>
              <Card.Title style={{ color: colors.primary_blue, height: "25%" }}>
                {post.title}
              </Card.Title>
              <Card.Text style={{ color: colors.DARK_GRAY, height: "25%" }}>
                {post.content.length > 50
                  ? `${post.content.substring(0, 50)}...`
                  : post.content}
              </Card.Text>
              <p
                style={{
                  color: post.underReview ? "red" : "grey",
                  fontSize: "14px",
                  height: "12%",
                }}
              >
                {post.underReview ? "Under Review (24h)" : "Reviewed"}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  minHeight: "40px",
                }}
              >
                <Button
                  style={{
                    backgroundColor: colors.btncolor,
                    borderColor: colors.btncolor,
                    width: "65px",
                  }}
                  onClick={() => handleFlag(post)}
                >
                  Flag
                </Button>
                <Button variant="danger" onClick={() => handleDelete(post.id)}>
                  Delete
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Flag Warning Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>⚠️ Warning: Inappropriate Content</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            The post you are flagging contains content that violates our
            community guidelines.
          </p>
          <p>
            If the user continues to post inappropriate content, their account
            may be suspended or permanently banned.
          </p>
          <p>Do you want to proceed with flagging this post?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmFlag}>
            Confirm Flag
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Posts;
