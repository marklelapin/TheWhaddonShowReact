import React from 'react';
import { uploadFiles } from '../DataAccess/DataAccess';

import {
    FormGroup,
    Label,
    Col,
    Button,
    Input
} from 'reactstrap';
export default class ImageUploader extends React.Component {

    constructor(props) {
        super(props);

        this.searchTags = true
        this.aria = true

        this.state = {
            images: []
        };
    }



    handleImageChange = (event) => {

        const imagesArray = Array.from(event.target.files)

        console.log(imagesArray)

        this.setState({
            images: imagesArray
        });
    }

    handleUploadClick = async () => {
        await uploadFiles(this.state.images, 'test')
        this.setState({ images: [] })
    } 

            render() {
                return (
                    <>
                        <FormGroup row>
                            <Label md="4" className="text-md-right">
                                Image upload
                            </Label>
                            <Col md="8">
                                <input
                                    accept="image/*" onChange={this.handleImageChange}
                                    id="selectImage"
                                    type="file" name="file" className="display-none"
                                />
                                <p>{this.state.images.length}</p>
                                <div className="fileinput fileinput-new fileinput-fix">
                                    <div className="fileinput-new thumbnail">
                                        {this.state.images.length > 0 ? <div>
                                            {this.state.images.map((image, idx) => (
                                                <img alt="..." src={image.preview} key={`img-id-${idx.toString()}`} />))}
                                        </div> : <img
                                            alt="..."
                                            src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxOTEiIGhlaWdodD0iMTQxIj48cmVjdCB3aWR0aD0iMTkxIiBoZWlnaHQ9IjE0MSIgZmlsbD0iI2VlZSIvPjx0ZXh0IHRleHQtYW5jaG9yPSJtaWRkbGUiIHg9Ijk1LjUiIHk9IjcwLjUiIHN0eWxlPSJmaWxsOiNhYWE7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LXNpemU6MTJweDtmb250LWZhbWlseTpBcmlhbCxIZWx2ZXRpY2Esc2Fucy1zZXJpZjtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj4xOTF4MTQxPC90ZXh0Pjwvc3ZnPg=="
                                        />}
                                    </div>
                                </div>
                                <div>
                                    <Button type="button" color="gray-default"><Label for="selectImage">Select image</Label></Button>
                                </div>
                            </Col>
                            {(this.state.searchTags) &&
                                <>
                                    <Label for="search-tags" md={4} className="text-md-right">
                                        Search Tags
                                    </Label>

                                    <div>
                                        <Input type="text" id="search-tags" placeholder="e.g. 2023 Band Rehearsal" />
                                        <span className="help-block">Separate tags with a space or leave blank.</span>
                                    </div>
                                </>
                            }
                            {(this.state.images.length > 0) &&
                                <div>
                                    <Button type="button" color="gray-default"><Label for="image-upload" onClick={this.handleUploadClick} >Upload image</Label></Button>
                                </div>

                            }
                        </FormGroup>


                    </>
                );
            }
        }

