import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'

import Header from '../components/Header'
import PostLink from "../components/post-link"
import './index.css'



const IndexPage = ({ data: { allMarkdownRemark: { edges } }, children }) => {
  const Posts = edges
    .map(edge => <PostLink key={edge.node.id} post={edge.node} />);

  return (
    <div>
      <Helmet
        title="2018 Liberal Policy Resolutions"
        meta={[
          { name: 'description', content: 'Liberal Policy Resolutions' },
          { name: 'keywords', content: 'Liberal Party, Policy, Convention, Resolutions' },
        ]}
      />
      <Header />
      <div
        style={{
          margin: '0 auto',
          maxWidth: 960,
          padding: '0px 1.0875rem 1.45rem',
          paddingTop: 0,
        }}
      >
        {children()}
      </div>
      <div
        style={{
          margin: '0 auto',
          maxWidth: 960,
          padding: '0px 1.0875rem 1.45rem',
          paddingTop: 0,
        }}
      >
        <h2>Policy List: </h2>
        {Posts}
      </div>
    </div>
  );
};


export default IndexPage

export const pageQuery = graphql`
  query IndexQuery {
    allMarkdownRemark(sort: { order: DESC, fields: [frontmatter___date] }) {
      edges {
        node {
          id
          frontmatter {
            path
            title
          }
        }
      }
    }
  }
`;
