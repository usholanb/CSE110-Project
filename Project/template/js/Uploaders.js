
// ======================================================================
// Uploader

function Uploader() {}
Uploader.prototype.upload = function(data){};

// ======================================================================
// ParseUploader

function ParseUploader() {}
extend(ParseUploader,Uploader);

// --------------------------------------------------
// upload
var PARSEUPLOAD_CODE_LOST = 0;
var PARSEUPLOAD_CODE_FOUND = 1;
ParseUploader.prototype.upload = function(item,obj_type){
    console.log('entered ParseUploader.upload...');

    // parameter has to be an ItemSpec
    if (!item || !item instanceof ItemSpec) return;
    console.log('input is an ItemSpec (great!)');

    console.log('initializing parse account...');
    Parse.initialize(
            "NJy4H7P2dhoagiSCTyoDCKrGbvfaTI1sGCygKTJc",
            "2D0fOvD5ftmTbjx2TJluZo7vZFzYHhm8tOHOjOFs",
            "sqkMsAkDsXmqyA5lffaUP8NQLFYPkC4cJKwlvhFt"
            );
    console.log('done');
    var upload_obj;
    if (obj_type === PARSEUPLOAD_CODE_LOST) {
        console.log('upload type: LOST');
        var Lost = Parse.Object.extend("Lost");
        upload_obj = new Lost();
    } else if (obj_type === PARSEUPLOAD_CODE_FOUND) {
        console.log('upload type: FOUND');
        var Found = Parse.Object.extend("FOUND");
        upload_obj = new Found();
    } else {
        console.log('Wrong obj_code for ParseUploader.upload');
    }

    // set data of upload_obj
    // notice image is NOT in the list and will be handled at uploading
    console.log('setting new upload_obj...');
    upload_obj.set("name",     String(item.reporter.getValue()));
    upload_obj.set("item",     String(item.itemName.getValue()));
    upload_obj.set("email",    String(item.email.getValue()));
    upload_obj.set("lostdate", Date(item.reportDate.getValue()));
    upload_obj.set("phone",    String(item.phone.getValue()));
    upload_obj.set("loc",      String(item.loc.getValue()));
    upload_obj.set("descp",    String(item.description.getValue()));
    upload_obj.set("LCname",   String(item.reporter.getValue()).toLowerCase());
    upload_obj.set("LCemail",  String(item.email.getValue()).toLowerCase());
    upload_obj.set("LCloc",    String(item.loc.getValue()).toLowerCase());
    upload_obj.set("LCitem",   String(item.itemName.getValue()).toLowerCase());
    console.log('done');

    // save myLost to parse
    console.log('uploading data to parse...');
    upload_obj.save(null, {
        success: function(upload_obj) {
            console.log('data saved sucessfully');
            console.log('start uploading photo');
            console.log('photo is', item.img.getValue() );
            if (item.img.file)
            ParseUploader.prototype.uploadFile(item.img.file,upload_obj.id);
            console.log('done');
        },
        error: function(upload_obj, error) {
            console.log('data did NOT save sucessfully');
            // TODO what to say / do?
            alert('Some error occured, please try later!');
        }
    });
    console.log('done');

    console.log('left ParseUploader.upload.');
};

// --------------------------------------------------
// upload file

ParseUploader.prototype.uploadFile = function(file,objID) {
    console.log('entered ParseUploader.uploadFile');

    // setups
    var serverUrl = 'https://api.parse.com/1/files/'+file.name;
    var headers = {
        "X-Parse-Application-Id": "NJy4H7P2dhoagiSCTyoDCKrGbvfaTI1sGCygKTJc",
        "X-Parse-REST-API-Key": "RHHtZvYCPb4AOiy2psXnkLlf1uyuD7RJQxUDoQ1Y"
    };

    // uploading using AJAX
    $.ajax({
        type: "POST",
        "headers": headers,
        url: serverUrl,
        data: file,
        processData: false,
        contentType: false,
        success: function(data) {
            console.log('successfully uploaded file '+file+' to '+objID);
            // link the newly added file to related parse obj
            ParseUploader.prototype.linkDataTo(data, objID);
        },
        error: function(data) {
            var obj = jQuery.parseJSON(data);
            console.error("Error: ");
        }
    });
}

// --------------------------------------------------
// link data (esp. files) to a parse obj.

ParseUploader.prototype.linkDataTo = function(data, objID) {
    console.log(data);
    console.log(objID);

    var headers = {
        "X-Parse-Application-Id": "NJy4H7P2dhoagiSCTyoDCKrGbvfaTI1sGCygKTJc",
        "X-Parse-REST-API-Key": "RHHtZvYCPb4AOiy2psXnkLlf1uyuD7RJQxUDoQ1Y"
    };
    $('#uploadedLink').append(data.url);
    $.ajax({
        'type': "PUT",
        'headers': headers,
        'url': "https://api.parse.com/1/classes/Lost/"+objID,
        "contentType": "application/json",
        "dataType": "json",
        'success': function(data) {
            console.log("post uploaded successfully");
            // TODO what to do?
        },
        'error': function(data) {
            console.log("an error occured during post upload");
            // TODO what to do?
        },
        "data": JSON.stringify({
            "myfile": {
                "name": data.name,
        "__type": "File"
            }
        })
    });
};

// --------------------------------------------------
