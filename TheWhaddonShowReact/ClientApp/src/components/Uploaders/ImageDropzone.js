import React from 'react';
import { useState, useCallback } from 'react';
import { uploadFiles } from '../../dataAccess/fileUtils';

import {
    FormGroup,
    Label,
    Row,
    Col,
    Button,
    Input,
    Container
} from 'reactstrap';
import Widget from '../../components/Widget'
import Dropzone from 'react-dropzone'
import s from '../../pages/forms/elements/Elements.module.scss';

function ImageDropzone(props) {

    const {
        singleFile = false
        , inputTags = true
        , dropZoneText = 'This dropzone accepts only images. Try dropping some here, or click to select files to upload.'
        , containerName
    } = props;

    if (!containerName) {
        throw new Error('No container name provided to ImageDropzone');
    }


    const [images, setImages] = useState([]);
    const [searchTags, setSearchTags] = useState([]);


    const handleDrop = useCallback((selectedFiles) => {

        if (selectedFiles === undefined || selectedFiles === null) return null
        /*const selectedFilesArray = Object.values(selectedFiles)*/
        setImages([...images, ...selectedFiles])
    }, []);

    const handleTagsChange = (event = null) => {
        if (event !== null) {
            setSearchTags(event.target.value)
        }

    }


    const handleUploadClick = async () => {


        if (images.length === 0) {
            alert('Please select at least 1 file to upload.')
        } else {
            await uploadFiles(images, containerName)
            this.setImages([])
            this.setSearchTags([])
        }
    }

    const handleClearClick = () => {
        setImages([])
        setSearchTags([])
    }


    return (


        <Widget
            title={<h6>Upload <strong> image{(singleFile) ? "" : "s"}</strong></h6>} collapse
        >
            <Container className="d-flex align-items- justify-content-center ">
                <FormGroup>
                    <Row>
                        <Dropzone
                            onDrop={handleDrop()} accept="image/*"
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

                                    <Input type="text" id="search-tags" placeholder="e.g. 2023 Band Rehearsal (or leave blank)" value={searchTags} onChange={handleTagsChange()} />
                                    <span className="help-block"> (These will be added as tags to the image for searching etc.)</span>
                                </div>
                            </div>

                        </Row>
                    }
                    <Row>
                        <Button type="button" color="primary" onClick={handleUploadClick()} disabled={images.length === 0}>Upload images</Button>
                    </Row>
                    {(images.length > 0) &&
                        <Row>
                            <Button type="button" color="danger" onClick={handleClearClick()} disabled={images.length === 0}>Clear selection</Button>
                        </Row>
                    }
                </FormGroup >
            </Container>
        </Widget >

    );

}
export default ImageDropzone;
