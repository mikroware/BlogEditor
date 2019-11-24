import Button from '@material-ui/core/Button'
import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import { Editor, EditorState, RichUtils, EditorBlock, DefaultDraftBlockRenderMap, AtomicBlockUtils, genKey, ContentBlock } from 'draft-js'
import { Map, List } from 'immutable'

const addNewBlockAt = (
    editorState,
    pivotBlockKey,
    newBlockType = 'unstyled',
    initialData = new Map({})
) => {
    const content = editorState.getCurrentContent();
    const blockMap = content.getBlockMap();
    const block = blockMap.get(pivotBlockKey);

    if (!block) {
        throw new Error(`The pivot key - ${ pivotBlockKey } is not present in blockMap.`);
    }

    const blocksBefore = blockMap.toSeq().takeUntil((v) => (v === block));
    const blocksAfter = blockMap.toSeq().skipUntil((v) => (v === block)).rest();
    const newBlockKey = genKey();

    const newBlock = new ContentBlock({
        key: newBlockKey,
        type: newBlockType,
        text: '',
        characterList: new List(),
        depth: 0,
        data: initialData,
    });

    const newBlockMap = blocksBefore.concat(
        [[pivotBlockKey, block], [newBlockKey, newBlock]],
        blocksAfter
    ).toOrderedMap();

    const selection = editorState.getSelection();

    const newContent = content.merge({
        blockMap: newBlockMap,
        selectionBefore: selection,
        selectionAfter: selection.merge({
            anchorKey: newBlockKey,
            anchorOffset: 0,
            focusKey: newBlockKey,
            focusOffset: 0,
            isBackward: false,
        }),
    });

    return EditorState.push(editorState, newContent, 'split-block');
};

const getCurrentBlock = (editorState) => {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();

    return contentState.getBlockForKey(selectionState.getStartKey());
};

const CustomBlock = (props) => {
    const { block, contentState, blockProps } = props;
    const data = null; //contentState.getEntity(block.getEntityAt(0)).getData();

    console.log('CustomBlock', block, contentState, blockProps, data);

    return (
        <div>
            <div contentEditable={false} readOnly>
                This is custom non editable?
            </div>
            <div>
                <EditorBlock {...props} />
            </div>
        </div>
    )
}

const CustomAtomic = (props) => {
    const { block, contentState, blockProps } = props;
    const entity = contentState.getEntity(block.getEntityAt(0));

    console.log('CustomAtomic', block, contentState, blockProps, entity.getData());

    if(entity.getType() === 'CustomBlock'){
        return (
            <div>
                This is custom non editable?
                <div>
                    <EditorBlock {...props} />
                </div>
            </div>
        )
    }
}

function myBlockRenderer(contentBlock) {
    const type = contentBlock.getType();

    if(type === 'CustomBlock'){
        return {
            component: CustomBlock,
            editable: true,
            props: {
                foo: 'bar',
            },
        };
    }

    if(type === 'atomic'){
        return {
            component: CustomAtomic,
            editable: true,
            props: {
                foo: 'bar',
            },
        };
    }
}


const RenderMap = new Map({
    CustomBlock: {
        element: 'div',
    }
}).merge(DefaultDraftBlockRenderMap);

const extendedBlockRenderMap = DefaultDraftBlockRenderMap.merge(RenderMap);

class BlogEditor extends Component {
    editor = createRef();

    state = {
        editorState: EditorState.createEmpty(),
    }

    componentDidMount(){
        this.editorFocus();
    }

    render() {
        const { test } = this.props;
        const { editorState } = this.state;

        console.log(editorState);

        const currentInline = editorState.getCurrentInlineStyle();
        console.log('current states', currentInline.toArray());

        console.log('Block', editorState.getCurrentBlockType);

        return (
            <div>
                Wtf is this
                {test && ' Yo!'}
                <Button
                    variant="outlined"
                    onClick={this.handleAddCustom}
                >Add custom</Button>

                <Button
                    variant={currentInline.contains('BOLD') ? 'contained' : 'outlined'}
                    onClick={this.handleSetBold}
                    onMouseDown={(e) => e.preventDefault()}
                >Bold</Button>

                <div onClick={this.editorFocus}>
                    <Editor
                        ref={this.editor}
                        editorState={editorState}
                        onChange={this.editorStateChange}

                        handleKeyCommand={this.handleKeyCommand}

                        blockRenderMap={extendedBlockRenderMap} // probably not needed, is mostly for paste mapping
                        blockRendererFn={myBlockRenderer}
                    />
                </div>
            </div>
        );
    }

    editorStateChange = (state, cb = undefined) => {
        this.setState({
            editorState: state,
        }, cb);
    }

    editorFocus = () => {
        if(this.editor && this.editor.current){
            this.editor.current.focus();
        }
    }

    handleAddCustom = () => {
        const { editorState } = this.state;

        // const selectionState = editorState.getSelection();
        //
        // if (!selectionState.isCollapsed()) {
        //     return editorState;
        // }
        //
        // const contentState = editorState.getCurrentContent();
        // const key = selectionState.getStartKey();
        // const blockMap = contentState.getBlockMap();
        // const currentBlock = getCurrentBlock(editorState);
        //
        // // if (!currentBlock || currentBlock.getLength() !== 0 || currentBlock.getType() === 'CustomBlock') {
        // //     return editorState;
        // // }
        //
        // const newBlock = currentBlock.merge({
        //     type: 'CustomBlock',
        //     data: {
        //         something: 'Data',
        //     },
        // });
        //
        // const newContentState = contentState.merge({
        //     blockMap: blockMap.set(key, newBlock),
        //     selectionAfter: selectionState,
        // });
        //
        // return EditorState.push(editorState, newContentState, 'change-block-type');


        // const contentState = editorState.getCurrentContent();
        //
        // const contentStateWithEntity = contentState.createEntity(
        //     'CustomBlock',
        //     'IMMUTABLE',
        //     { src: 'WHATEVER' }
        // );
        //
        // const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        // const newEditorState = EditorState.set(
        //     editorState,
        //     { currentContent: contentStateWithEntity },
        //     'create-entity'
        // );
        //
        // this.setState({
        //     editorState: AtomicBlockUtils.insertAtomicBlock(
        //         newEditorState,
        //         entityKey,
        //         ' '
        //     )
        // }, () => {
        //         setTimeout(() => this.editorFocus(), 0);
        // });

        this.editorStateChange(
            addNewBlockAt(editorState, editorState.getSelection().getAnchorKey(), 'CustomBlock')
        );
    }

    handleSetBold = () => {
        const { editorState } = this.state;

        this.editorStateChange(
            RichUtils.toggleInlineStyle(editorState, 'BOLD'),
            () => setTimeout(() => this.editorFocus(), 0)
        );
    }

    handleKeyCommand = (command) => {
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command)

        if(newState){
            this.editorStateChange(newState);
            return 'handled';
        }

        return 'not-handled';
    }
}

BlogEditor.propTypes = {
    test: PropTypes.bool,
};

export default BlogEditor
