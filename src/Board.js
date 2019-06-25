import React from "react";
import PropTypes from "prop-types";
import Gallery from "react-photo-gallery";
import Carousel, { Modal, ModalGateway } from "react-images";
// import Modal from "react-modal";
import "./Board.css";

export default class Board extends React.Component {
  state = {
    currentImage: 0,
    lightboxIsOpen: false
  };

  openLightbox = (event, obj) => {
    this.setState({
      currentImage: obj.index,
      lightboxIsOpen: true
    });
  };

  closeLightbox = () => {
    this.setState({
      currentImage: 0,
      lightboxIsOpen: false
    });
  };

  gotoImage = index => {
    this.setState({
      currentImage: index
    });
  };

  gotoNext = () => {
    this.setstate(state => {
      return { currentImage: state.currentImage + 1 };
    });
  };

  gotoPrevious = () => {
    this.setstate(state => {
      return { currentImage: state.currentImage - 1 };
    });
  };

  render() {
    const { images } = this.props;
    const { currentImage: currentIndex, lightboxIsOpen } = this.state;

    if (images.length === 0) {
      return null;
    }

    const galleryImages = [];
    const lightboxImages = [];
    images.forEach(el => {
      galleryImages.push({
        src: el.imageUrl,
        width: el.width,
        height: el.height,
        alt: el.description,
        key: el._id
      });
      lightboxImages.push({
        src: el.imageUrl,
        caption: el.description,
        alt: el.description,
        hostname: (new URL(el.sourceUrl)).hostname,
        sourceUrl: el.sourceUrl
      });
    });

    return (
      <div>
        <Gallery photos={galleryImages} onClick={this.openLightbox} />
        {/* <Lightbox
          images={lightboxImages}
          backdropClosesModal={true}
          currentImage={this.state.currentImage}
          isOpen={this.state.lightboxIsOpen}
          onClickNext={this.gotoNext}
          onClickPrev={this.gotoPrevious}
          onClickThumbnail={this.gotoImage}
          onClose={this.closeLightbox}
          width={1920}
          customControls={[
            <a key={1}>www.reddit.com</a>,
            <span key={2}> - </span>,
            <button key={3} onClick={this.openEdit}>edit</button>,
            <span key={4} style={{flexGrow: 1}}></span>
          ]}
        /> */}
        <ModalGateway>
          {lightboxIsOpen ? (
            <Modal onClose={this.closeLightbox}>
              <Carousel
                components={{
                  FooterCaption: ({ currentView }) => {
                    const { caption, hostname, sourceUrl } = currentView;
                    return (
                      <span className="imageCaption">
                        <span>{caption}</span>
                        <a href={sourceUrl}>{hostname}</a>
                      </span>
                    );
                  }
                }}
                currentIndex={currentIndex}
                hideControlsWhenIdle={false}
                styles={{
                  footer: base => ({ ...base, alignItems: "flex-end" })
                }}
                views={lightboxImages}
              />
            </Modal>
          ) : null}
        </ModalGateway>
      </div>
    );
  }
}

Board.propTypes = {
  images: PropTypes.array.isRequired
};
