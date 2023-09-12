import React from 'react';
import { uploadFiles } from '../DataAccess/DataAccess';

import {
    FormGroup,
    Label,
    Row,
    Col,
    Button,
    Input,
    Container
} from 'reactstrap';
import Widget from 'components/Widget'
import Dropzone from 'react-dropzone'
import s from 'pages/forms/elements/Elements.module.scss';
export default class ImageUploader extends React.Component {

    static defaultProps = {
        singleFile: false,
        inputTags: true,
        dropZoneText: 'This dropzone accepts only images. Try dropping some here, or click to select files to upload.'
    };

    constructor(props) {
        super(props);

        this.state = {
            images: []
            ,searchTags: []
        };
    }

    handleDrop = (selectedFiles) => {
        this.setState({
            images: [...this.state.images, ...selectedFiles]
        })
    }

    handleTagsChange = (event) => {
        this.setState({ searchTags: event.target.value })
    }


    handleUploadClick = async () => {
        if (this.state.images.length === 0) {
            alert('Please select at least 1 file to upload.')
        } else {
            await uploadFiles(this.state.images, 'test')
            this.setState({ images: [] })
            this.setSate({ searchTags: [] })
        }
    }

    handleClearClick = () => {
        this.setState({ images: [] })
        this.setState({ searchTags: []})
    }

    render() {
        
        const { singleFile, inputTags, dropZoneText } = this.props;

        const { images,searchTags } = this.state;

        return (


            <Widget
                title={<h6>Upload <strong> image{(singleFile) ? "" : "s"}</strong></h6>} collapse
            >
                <Container className="d-flex align-items- justify-content-center ">
                    <FormGroup>
                        <Row>
                            <Dropzone
                                onDrop={this.handleDrop} accept="image/*"
                                className={`${s.dropzone} dropzone`}
                            >
                                {images.length > 0 ?

                                    <Row>
                                        {images.map((image, idx) => (
                                            <Col>

                                                <div className="display-inline-block me-2 mb-xs" key={`drop-id-${idx.toString()}`}>
                                                    <img alt="..." src={URL.createObjectURL(image)} className="img-fluid" />
                                                    <div>{image.name}</div>
                                                </div>
                                            </Col>
                                        ))}
                                    </Row>

                                    : <p>{dropZoneText}</p>}
                            </Dropzone>
                        </Row>
                        {(inputTags) &&
                            <Row>

                                <div className="my-3">
                                    <Label for="search-tags" md={4} className="text-md-right mb-1">
                                        Search Tags 
                                    </Label>
                                   
                                    <div>
                                        
                                        <Input type="text" id="search-tags" placeholder="e.g. 2023 Band Rehearsal (or leave blank)" value={searchTags} onChange={this.handleTagsChange} />
                                        <span className="help-block"> (These will be added as tags to the image for searching etc.)</span>
                                    </div>
                                </div>

                            </Row>
                        }
                        <Row>
                            <Button type="button" color="primary" onClick={this.handleUploadClick} disabled={images.length === 0}>Upload images</Button>
                        </Row>
                        {(images.length > 0) &&
                            <Row>
                                <Button type="button" color="danger" onClick={this.handleClearClick} disabled={images.length === 0}>Clear selection</Button>
                            </Row>
                        }
                    </FormGroup >
                </Container>
            </Widget >

        );
    }
}

