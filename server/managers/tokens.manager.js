import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import Tokens from '../../server/models/tokens.model'

function create(req, callback) {  
  console.log(req.user.id )
  Tokens.where({token: req.body.token }).fetch().then((token_exists) => {
    if(token_exists) {
        if(req.user.id == token_exists.attributes.user_id) {
          callback(null,{data:{ message: responseMsg.messages.tokenUpdated }, code: responseCode.ok })
        }
        else {
          token_exists.save({ user_id: req.user.id }, { patch: true }).then((newUser) => {
            callback(null, { code: responseCode.ok, data:{ message: responseMsg.messages.tokenCreated, data: newUser } });
            });
        }
    } else {
          Tokens
          .forge({token: req.body.token, user_id: req.user.id, platform: req.body.platform})
          .save()
          .then((fcm_token) =>{
            callback(null, { code: responseCode.ok, data:{ message: responseMsg.messages.tokenCreated, data: fcm_token }});
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	
       
    }
  })
    
        
}

export default { create }