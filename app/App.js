import React, { Component, Fragment } from 'react';

import Button from './components/Button';
import Input from './components/Input';
import Block from './components/Block';
import Collaborate from './components/Collaborate';
import { MainTitle, SecondaryTitle } from './components/Title';

import { getTitleFromPr, appendMDToPr, hasPRBody } from './utils/chromeConnector';

import './styles';

const getMDCode = url => `![](${url})`;

class App extends Component {
  constructor() {
    super();
    this.state = {
      gifUrl: null,
      mdCode: null,
      keyword: null,
      copied: false,
      ableToInsert: false,
      inserted: false,
      isLoaded: false
    };

    this.mdCodeRef = React.createRef();
    this.handleImageLoad = this.handleImageLoad.bind(this);
    this.handleGifRequest = this.handleGifRequest.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleMDCopy = this.handleMDCopy.bind(this);
    this.handleMDAppend = this.handleMDAppend.bind(this);
  }

  componentDidMount() {
    hasPRBody().then(() => {
      this.setState({ ableToInsert: true });
    })
    getTitleFromPr().then(keyword => {
      this.setState({ keyword }, this.handleGifRequest);
    });
  }

  handleGifRequest() {
    const keyParam = 'api_key=VwV9rz5sgKf0uBViFwBlU9b8H3lmossH';
    const params = this.state.keyword ? `tag=${this.state.keyword}&${keyParam}` : keyParam;

    this.setState({
      isLoaded: false,
      copied: false,
      inserted: false
    }, () => {
      fetch(`https://api.giphy.com/v1/gifs/random?${params}`)
        .then(res => res.json())
        .then(response => {
          this.setState({
            gifUrl: response.data.images.downsized_large.url,
            mdCode: getMDCode(response.data.images.downsized_large.url)
          });
        })
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

  handleMDCopy() {
    this.mdCodeRef.current.select();
    document.execCommand('copy');
    this.setState({
      copied: true
    });
  }

  handleMDAppend() {
    appendMDToPr(this.state.mdCode)
      .then(() => {
        this.setState({
          inserted: true
        })
      })
      .catch(err => {
        console.log('err', err);
      });
  }

  render() {
    const imgStyles = {
      display: this.state.isLoaded ? 'block' : 'none',
      textAlign: 'center'
    };

    return (
      <div style={{minWidth: '250px'}}>
        <MainTitle>Animate your PRs</MainTitle>
        <Block>
          <Input type="text" onChange={this.handleInputChange} defaultValue={this.state.keyword} />
          <Button onClick={this.handleGifRequest}>Search!</Button>
        </Block>
        {this.state.gifUrl && (
          <Fragment>
            {!this.state.isLoaded && (
              <div>Loading GIF...</div>
            )}
            <div style={imgStyles}>
              <img src={this.state.gifUrl} onLoad={this.handleImageLoad}/>
              <SecondaryTitle>MarkDown code</SecondaryTitle>
              <Block vertical>
                <Input innerRef={this.mdCodeRef} type="text" defaultValue={this.state.mdCode} readOnly vertical />
                <Button vertical onClick={this.handleMDCopy}>
                  {this.state.copied ? 'Copied!' : 'Copy'}
                </Button>
                {this.state.ableToInsert && (
                  <Button vertical onClick={this.handleMDAppend}>
                    {this.state.inserted ? 'Inserted!' : 'Insert MD code!'}
                  </Button>
                )}
                <Collaborate />
              </Block>
            </div>
          </Fragment>
        )}
        
      </div>
    )
  }
}

export default App;