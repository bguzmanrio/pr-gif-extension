import React, { Component, Fragment } from 'react';

import LoadingImage from '../common/components/LoadingImage';
import { getTitleFromPr, appendMDToPr, hasPRBody } from '../common/utils/chromeConnector';
import { requestGIF } from '../common/utils/requestGif';

import Button from './components/Button';
import CopyButton from './components/CopyButton';
import Input from './components/Input';
import Block from './components/Block';
import Collaborate from './components/Collaborate';
import Sponsor from './components/Sponsor';
import Footer from './components/Footer';
import Form from './components/Form';
import { MainTitle, SecondaryTitle } from './components/Title';

import './styles';

class App extends Component {
  constructor() {
    super();
    this.state = {
      gifUrl: null,
      mdCode: null,
      keyword: null,
      ableToInsert: false,
      inserted: false,
      isLoaded: false
    };

    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.handleGifRequest = this.handleGifRequest.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMDAppend = this.handleMDAppend.bind(this);
  }

  componentDidMount() {
    hasPRBody().then(() => {
      this.setState({ ableToInsert: true });
    }).catch(() => {
      console.log('No Pull-Request body found');
    });

    getTitleFromPr().then(({ payload }) => {
      this.setState({ keyword: payload.title }, this.handleGifRequest);
    }).catch(() => {
      console.log('No Pull-Request title found');
    });
  }

  handleGifRequest(e) {
    e && e.preventDefault();
    this.setState({
      isLoaded: false,
      inserted: false
    }, () => {
      requestGIF(this.state.keyword).then(newGIF => {
        this.setState(newGIF);
      });
    })
  }

  handleImageLoad() {
    this.setState({
      isLoaded: true
    })
  }

  handleInputChange(e) {
    this.setState({
      keyword: e.target.value
    });
  }

  handleMDAppend() {
    appendMDToPr({ mdCode: this.state.mdCode })
      .then(() => {
        this.setState({
          inserted: true
        })
      })
      .catch(err => {
        console.log('err', err);
      });
  }

  getSearchMessage() {
    return this.state.gifUrl ? 'Search again' : 'Search';
  }

  render() {
    const imgStyles = this.state.isLoaded ? {} : { display: 'none'};

    return (
      <div style={{minWidth: '400px'}}>
        <MainTitle>GIFHub Pull-Requests</MainTitle>
        <SecondaryTitle>Find the perfect GIF for your new cool feature!</SecondaryTitle>
        <Form>
          <Block>
            <Input type="text" onChange={this.handleInputChange} defaultValue={this.state.keyword} autoFocus />
            <Button type="submit" onClick={this.handleGifRequest}>{this.getSearchMessage()}</Button>
          </Block>
        </Form>
        {this.state.gifUrl && (
          <Fragment>
            <LoadingImage
              isLoaded={this.state.isLoaded}
              handleImageLoad={this.handleImageLoad}
              imgSrc={this.state.gifUrl}
            />
            <Block vertical style={imgStyles}>
              <CopyButton url={this.state.mdCode} copiedText="Copied!" copyText="Copy MarkDown code" />
              <CopyButton url={this.state.gifUrl} copiedText="Copied!" copyText="Copy GIF URL" />
              {this.state.ableToInsert && (
                <Button vertical onClick={this.handleMDAppend}>
                  {this.state.inserted ? 'Inserted!' : 'Insert MD code!'}
                </Button>
              )}
            </Block>
          </Fragment>
        )}
        <Footer>
          <Sponsor />
          <Collaborate />
        </Footer>
      </div>
    )
  }
}

export default App;