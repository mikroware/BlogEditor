import React from 'react'
import makeStyles from '@material-ui/core/styles/makeStyles'
import BlogEditor from '../BlogEditor'

const useStyles = makeStyles(theme => ({
    root: {
        margin: '30px auto',
        width: '1000px',
        backgroundColor: theme.palette.common.white,
    },
}));

const Example = () => {
    const classes = useStyles();

    return (
        <div className={classes.root}>
            <BlogEditor
                test={true}
            />
        </div>
    );
};

export default Example
