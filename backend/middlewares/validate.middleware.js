const validate = (schema) => {
    return function(req,res,next){
        const {error} = schema.validate(req.body, {abortEarly: false});

        if(error){
            const errors = error.details.map(e => e.message).join(', ');
            return res.status(500).json({
                sccess: false,
                message: errors
            });
        }

        next();
    }
}

module.exports = {validate};