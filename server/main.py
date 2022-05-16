from flask import Flask, jsonify, abort, request, Response, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import stripe
from sqlalchemy.orm import relationship
from sqlalchemy import * 
from datetime import datetime, date
from datetime import datetime
from flask_socketio import SocketIO, send, join_room, leave_room, emit

#Needed for image handling
import os
from werkzeug.utils import secure_filename
UPLOAD_FOLDER = '../client/assets/img_uploads' #Should be located on server: UPLOAD_FOLDER = '../server/img_uploads2'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app = Flask(__name__, static_folder = '../client', static_url_path='/')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = "HEMLIGNYCKELTDDD83"
app.config['STRIPE_PUBLIC_KEY'] = 'pk_test_51IUAh8IMrIYuplAm2iQZG65L9Y6lOVuz1OMawl9m8f8vSX6k5cxNy2QbZGYoU4yUdIHT1gZq3UlBtT58eQAWDTQT00D6xMd8BD'
app.config['STRIPE_SECRET_KEY'] = 'sk_test_51IUAh8IMrIYuplAmfW3p2VE36WVfOzd4qZh51L3Hf2I7LVvr3MSZECFPkgCs61G1xQWs7ngj99uFFWuU8DFU5J2600EJHS0hgU'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
socketio = SocketIO(app, cors_allowed_origins='*')
stripe.api_key = app.config['STRIPE_SECRET_KEY']

#Registrations of interest - better as standalone table than model, according to several sources
registered_interest = db.Table('registered_interest', 
    db.Column('apartment_id', db.Integer, db.ForeignKey('apartment.id')),
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'))
)

#Admin
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    password_hash = bcrypt.generate_password_hash('123123').decode('utf8')

    def __repr__(self):
        return '<Admin {}: {}>'.format(self.id, self.username)

    def serialize(self):
        return dict(id=self.id, username=self.username)
    
#Användare
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(20), nullable=False)
    first_name = db.Column(db.String(20), nullable=False)
    last_name = db.Column(db.String(20), nullable=False)
    bio = db.Column(db.String(500), nullable=False)
    occupation = db.Column(db.String(20), nullable=False)
    current_apartment = db.relationship('Apartment', uselist = False, backref='tenant', lazy=True, foreign_keys='Apartment.tenant_id')
    apartments = db.relationship('Apartment', backref='owner', lazy=True, foreign_keys='Apartment.user_id', cascade='all, delete, delete-orphan')
    reviews = db.relationship('Review', backref='user', lazy=True, cascade='all, delete, delete-orphan')
    customer_id = db.Column(db.String, nullable=False)
    is_student = db.Column(db.Boolean, nullable=False)
    current_apartment = db.relationship('Apartment', uselist = False, backref='tenant', lazy=True, foreign_keys='Apartment.tenant_id')

    # interest_list: attribute for conecting User & Apartment via registered_interest
    # Backref interested_users in interest_list can be seen as creating a field in the child table (Apartment). Can be accessed without declaring it in Apartment
    # lazy: how the data willbe loaded in interested_users (so it's not all loaded into the model)
    # lazy=dynamic instead gets a query that can be run, and filter to get whatever data we want.
    interest_list = db.relationship('Apartment', secondary=registered_interest, backref=db.backref('interested_users', lazy='dynamic'))

  #  interest_list = db.relationship('Apartment', secondary=registered_interest, lazy='subquery', backref=db.backref('users', lazy=True)) 
    #lazy could also be either "dynamic" or "joined"
   
   # apartment_id = db.Column(db.Integer, db.ForeignKey('apartment.id'), nullable=False)
   # interest_list = relationship(
   #     "Apartment",
   #     secondary=registered_interest,
   #     back_populates='interested_users')
    
    password_hash = db.Column(db.String, nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')

    def __repr__(self):
        return '<User {}: {} {}>'.format(self.id, self.email, self.first_name, self.last_name, self.bio, self.occupation, self.apartments, self.reviews)
    
    def serialize(self):

        if self.current_apartment is not None:
            current_apartment_id = self.current_apartment.id
        else:
            current_apartment_id = None

        return dict(id=self.id, email=self.email, first_name=self.first_name, last_name=self.last_name, bio=self.bio, occupation=self.occupation, customer_id = self.customer_id, is_student = self.is_student, current_apartment_id = current_apartment_id)

#Annons
class Ad(db.Model): 
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(500), nullable=False)
    rent = db.Column(db.Integer, nullable=False)
    start_date = db.Column(db.String(12), nullable=False)
    end_date = db.Column(db.String(12), nullable=False)
    apartment_id = db.Column(db.Integer, db.ForeignKey('apartment.id', ondelete='cascade'), nullable=False)
    paid = db.Column(db.Boolean, default=False, nullable=False)

    def __repr__(self):
        return '<Ad {}: {} {}>'.format(self.id, self.description, self.rent, self.start_date, self.end_date, self.apartment_id)
    
    def serialize(self):

        if self.apartment is not None:
            apartment_serialize = self.apartment.serialize()
        else:
            apartment_serialize = None

        return dict(id=self.id, description=self.description, rent=self.rent, start_date=self.start_date, end_date=self.end_date, apartment=apartment_serialize, paid=self.paid)

#Lägenheter
class Apartment(db.Model):
    __tablename__ = 'apartment'
    id = db.Column(db.Integer, primary_key=True)
    address = db.Column(db.String(50), nullable=False)
    city = db.Column(db.String(20), nullable=False)
    state = db.Column(db.String(20), nullable=False)
    zip_code = db.Column(db.Integer, nullable=False)
    rooms = db.Column(db.Integer, nullable=False)
    area = db.Column(db.Integer, nullable=False)
    ad = db.relationship('Ad', backref='apartment', lazy=True, cascade='all, delete, delete-orphan')
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='cascade'), nullable=False)
    images = db.relationship('Image', backref='apartment', lazy=True, cascade='all, delete, delete-orphan')
    tenant_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    def __repr__(self):
        return '<Apartment {}: {} {}>'.format(self.id, self.address, self.ad, self.user_id)

    def serialize(self):
        if self.owner is not None:
            owner_serialize = self.owner.serialize()
        else:
            owner_serialize = None
        
        if self.tenant is not None:
            tenant_serialize = self.tenant.serialize()
        else:
            tenant_serialize = None

        images_ser = []
        if self.images is not None:
            for image in self.images:
                images_ser.append(image.serialize())
            
        return dict(id=self.id, address=self.address, city=self.city, state=self.state, zip_code=self.zip_code, rooms=self.rooms, area=self.area, owner=owner_serialize, images=images_ser, tenant=tenant_serialize)


#Images (the file names for images are stored in the database and can be seen as a multivalued attribute to apartments)
class Image(db.Model):
    __tablename__ = 'image'
    apartment_id = db.Column(db.Integer, db.ForeignKey('apartment.id', ondelete='cascade'), primary_key=True)
    image_name = db.Column(db.String(50), primary_key=True)
    #room = db.Column(db.String(20), nullable=True) 

    def serialize(self):
        return dict(apartment_id=self.apartment_id, image_name=self.image_name)

#Reviews of users
class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    text = db.Column(db.String(500), nullable=False)
    date = db.Column(db.String, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete='cascade'), nullable=False)
    
    def __repr__(self):
        return '<Review {}: {} {}>'.format(self.id, self.rating, self.text, self.user_id, self.date)

    def serialize(self):    
        return dict(id=self.id, rating=self.rating, text=self.text, user_id=self.user_id, date=self.date)



@app.route('/', defaults={'path': ""})
@app.route('/<string:path>')
@app.route("/<path:path>")
def catch_all(path):
    return app.send_static_file("index.html")

@app.errorhandler(404)
def page_not_found(e):
    ###tar bort allt efter sista "/" och försöker igen
    ###faq/fel1/feligen -> faq/fel1 -> faq
    ###fel/fel2 -> fel -> /
    split = request.path.split("/")[:-1]
    if len(split) == 1:
        return redirect("/")
    joined = "/".join(split)
    return redirect(joined)



#Register interest in given apartment for logged in user
@app.route('/register-interest/<int:apartment_id>', methods=['POST'])
@jwt_required()
def registerinterest(apartment_id):
    if request.method == 'POST': # testing "get interesting apartments for user with given id"
        logged_in_user = User.query.get(get_jwt_identity())
        relevant_apartment = Apartment.query.get_or_404(apartment_id)
       
        if  not (relevant_apartment in  logged_in_user.interest_list):
            logged_in_user.interest_list.append(relevant_apartment) # where interested_users is the backref (but used for Apartments; for Users it's interest_list)
            db.session.add(logged_in_user)
            db.session.commit()
            return "OK"
        else:
            return Response("Du kan bara intresseanmäla en gång.", status=400, mimetype="application/json")

#Returns list of interested users for a given apartment if owner of apartment is logged in
@app.route('/interested-users/<int:apartment_id>', methods=['GET'])
@jwt_required()
def interestedusers(apartment_id):
    if request.method == 'GET': 
        logged_in_user_id = User.query.get(get_jwt_identity()).id
        relevant_apartment = Apartment.query.get_or_404(apartment_id)

        print(logged_in_user_id)
        print(relevant_apartment.user_id)

        if logged_in_user_id == relevant_apartment.user_id:
            interested_user_list = []
            for user in relevant_apartment.interested_users:
                interested_user_list.append(user.serialize())
            return jsonify(interested_user_list)
        return "Du äger inte den här lägenheten"

#Selects an interested user to be a tenant of the apartment in question
@app.route('/interested-users/<int:apartment_id>/select/<int:user_id>', methods=['PUT'])
@jwt_required()
def selecttenant(apartment_id, user_id):
    print("server")
    if request.method == 'PUT':
        logged_in_user_id = User.query.get(get_jwt_identity()).id
        relevant_apartment = Apartment.query.get(apartment_id)

        if logged_in_user_id == relevant_apartment.user_id:
            interested_user = User.query.get(user_id)
            print(interested_user.current_apartment)
            relevant_apartment.tenant = interested_user
            print(interested_user.current_apartment)
            for each in interested_user.interest_list:
                if each.id == apartment_id:
                    print(each.serialize())
                    interested_user.interest_list.remove(each)
            db.session.commit()
            return("OK")
        return "Du äger inte den här lägenheten"


#Returns list of apartments that logged in user is interested in
@app.route('/interesting-apartments', methods=['GET'])
@jwt_required()
def interestingapartments():
    if request.method == 'GET': 
        logged_in_user_id = User.query.get(get_jwt_identity()).id
        interesting_apartments = []
        for apartment in User.query.get_or_404(logged_in_user_id).interest_list:
            interesting_apartments.append(apartment.serialize())
        return jsonify(interesting_apartments)
        
#Deletes interest for specific apartment that logged in user previously was interested in
@app.route("/interesting-apartments/<int:apt_id>", methods =["DELETE"])
@jwt_required()
def specific_apartment_interest(apt_id):
    if request.method == "DELETE":
        current_user = User.query.get(get_jwt_identity())
        current_user_id = current_user.id
        for each in current_user.interest_list:
            if each.id == apt_id:
                current_user.interest_list.remove(each)
                db.session.commit()
                return Response("ok", status=200, mimetype='application/json')
    
        return Response("du kan inte ta bort en intresseanmälan sopm inte finns", status=400, mimetype='application/json')

#I dont think this route is used anymore //Alva
#Gets all users in database or adds new user
@app.route('/users', methods=['GET', 'POST'])
@jwt_required()
def users():
    user_list = []
    
    if request.method == 'GET':
        for user in User.query.all():
            user_list.append(user.serialize())
        return jsonify(user_list)

    elif request.method == 'POST':
        request_data = request.get_json()
        new_user = User(email = request_data['email'], first_name = request_data['first_name'], last_name = request_data['last_name'], bio = request_data['bio'], occupation = request_data['occupation'])
        db.session.add(new_user)
        db.session.commit()

        return jsonify(new_user.serialize())

#Gets all ads in database or adds new ad
@app.route('/ads', methods=['GET', 'POST'])
@jwt_required()
def ads():
    ad_list = []
    
    if request.method == 'GET':
        for ad in Ad.query.all():
            ad_list.append(ad.serialize())
        return jsonify(ad_list)

    elif request.method == 'POST':
        request_data = request.get_json()
        new_ad = Ad(description = request_data['description'], rent = request_data['rent'], start_date = request_data['start_date'], end_date = request_data['end_date'], apartment_id = request_data['apartment_id'])
        db.session.add(new_ad)
        db.session.commit()

        return jsonify(new_ad.serialize())

#Gets ads that fulfill user's criteria on state, room, area and rent
@app.route('/ads/state=<state>&room=<room>&area=<area>&rent=<rent>', methods=['GET']) 
def adsfilter(state, room, area, rent):
    ad_list = []
    
    if request.method == 'GET':
        if state == "Alla":
            for ad in Ad.query.join(Ad.apartment).filter(Apartment.rooms >= room, Apartment.area >= area, Ad.rent <= rent).all():
                ad_list.append(ad.serialize())
            return jsonify(ad_list)      
        else:
            for ad in Ad.query.join(Ad.apartment).filter(Apartment.state == state, Apartment.rooms >= room, Apartment.area >= area, Ad.rent <= rent).all():
                ad_list.append(ad.serialize())
            return jsonify(ad_list)        

#Gets all apartments in database or adds new apartment
@app.route('/apartments', methods=['GET', 'POST'])
@jwt_required()

def apartments():
    apartment_list = []
    
    if request.method == 'GET':
        for apartment in Apartment.query.all():
            apartment_list.append(apartment.serialize())
        return jsonify(apartment_list)

    elif request.method == 'POST':
        request_data = request.get_json()
        new_apartment = Apartment(address = request_data['address'], city = request_data['city'], state = request_data['state'], zip_code = request_data['zip_code'], rooms = request_data['rooms'], area = request_data['area'], user_id = User.query.get(get_jwt_identity()).id)
        db.session.add(new_apartment)
        db.session.commit()

        return jsonify(new_apartment.serialize())
    
#Checks filename for uploaded images
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

#Handles images for specific apartment
@app.route('/upload-img/<int:apartmentId>', methods=['POST', 'DELETE'])
def upload_file(apartmentId):
    if request.method == 'POST':
        file = request.files['firstImage']
        if file and allowed_file(file.filename):
            first_image_name = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], first_image_name))
            new_first_image = Image(apartment_id = apartmentId, image_name = first_image_name) 
            if not db.session.query(Image).filter_by(apartment_id = apartmentId, image_name = first_image_name).first():  
                db.session.add(new_first_image)

        file = request.files['secondImage']
        if file and allowed_file(file.filename):
            second_image_name = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], second_image_name))
            new_second_image = Image(apartment_id = apartmentId, image_name = second_image_name)
            if not db.session.query(Image).filter_by(apartment_id = apartmentId, image_name = second_image_name).first():   
                db.session.add(new_second_image)

        file = request.files['thirdImage']
        if file and allowed_file(file.filename):
            third_image_name = secure_filename(file.filename)
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], third_image_name))
            new_third_image = Image(apartment_id = apartmentId, image_name = third_image_name)
            if not db.session.query(Image).filter_by(apartment_id = apartmentId, image_name = third_image_name).first():  
                db.session.add(new_third_image)

        db.session.commit()
        return '', 204

    if request.method == 'DELETE':
        for image in Image.query.filter_by(apartment_id = apartmentId).all(): 
            print(image.image_name)
            db.session.delete(image)
        db.session.commit()
        return '', 204

    abort(404)
        
#Not sure if this route will be used //Alva
#Gets all rewievs in database or adds new review
@app.route('/reviews', methods=['GET', 'POST'])
def reviews():
    review_list = []
    
    if request.method == 'GET':
        for review in Review.query.all():
            review_list.append(review.serialize())
        return jsonify(review_list)

    elif request.method == 'POST':
        current_date = date.today()
        current_date_string = current_date.strftime("%Y-%m-%d")
        request_data = request.get_json()
        new_review = Review(rating = request_data['rating'], text = request_data['text'], user_id = request_data['user'], date = current_date_string)
        db.session.add(new_review)
        db.session.commit()

        return jsonify(new_review.serialize())

#Used to get, edit and delete specific user
@app.route('/users/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def specific_user(user_id):
    new_user = User.query.get_or_404(user_id)

    if request.method == 'GET':
        return jsonify(new_user.serialize())

    elif request.method == 'PUT':
        request_data = request.get_json()     
        if("email" in request_data):
            new_user.email = request_data['email']
        if("first_name" in request_data):
            new_user.first_name = request_data['first_name']
        if("last_name" in request_data):
            new_user.last_name = request_data['last_name']
        if("bio" in request_data):
            new_user.bio = request_data['bio']
        if("occupation" in request_data):
            new_user.occupation = request_data['occupation']
        if ("is_student" in request_data):
            new_user.is_student = request_data['is_student']
                 
        db.session.commit()
        return jsonify(new_user.serialize())

    elif request.method == 'DELETE': 
        db.session.delete(new_user)
        db.session.commit()
        return "ok"

    abort(404)

#Used to get, edit, and delete specific apartment
@app.route('/apartments/<int:apartment_id>', methods=['GET', 'PUT', 'DELETE'])    
@jwt_required()
def specific_apartment(apartment_id):
    new_apartment = Apartment.query.get_or_404(apartment_id)

    if request.method == 'GET':
        return jsonify(new_apartment.serialize())

    elif request.method == 'PUT':           
        request_data = request.get_json()
        if("address" in request_data):
            new_apartment.address = request_data['address']
        if("city" in request_data):
            new_apartment.city = request_data['city'] 
        if("state" in request_data):
            new_apartment.state = request_data['state']
        if("zip_code" in request_data):
            new_apartment.zip_code = request_data['zip_code']
        if("rooms" in request_data):
            new_apartment.rooms = request_data['rooms'] 
        if("area" in request_data):
            new_apartment.area = request_data['area']
        db.session.commit()
        return jsonify(new_apartment.serialize())

    elif request.method == 'DELETE':
        db.session.delete(new_apartment)
        db.session.commit()
        return "ok"

    abort(404)

#Used to get, edit and delete specific ad
@app.route('/ads/<int:ad_id>', methods=['GET', 'PUT', 'DELETE'])    
def specific_ad(ad_id):
    new_ad = Ad.query.get_or_404(ad_id)

    if request.method == 'GET':
        return jsonify(new_ad.serialize())

    elif request.method == 'PUT':  
        request_data = request.get_json()     
        if("description" in request_data):
            new_ad.description = request_data['description']
        if("rent" in request_data):
            new_ad.rent = request_data['rent']
        if("start_date" in request_data):
            new_ad.start_date = request_data['start_date']
        if("end_date" in request_data):
            new_ad.end_date = request_data['end_date']
        if("paid" in request_data):
            new_ad.paid = request_data['paid']    
        db.session.commit()
        return jsonify(new_ad.serialize())

    elif request.method == 'DELETE':
        db.session.delete(new_ad)
        db.session.commit()
        return "ok"

    abort(404)

#Used to edit and delete specific ad jwt-required
# @app.route('/ads/<int:ad_id>', methods=['PUT', 'DELETE'])    
# @jwt_required()
# def edit_delete_ad(ad_id):
#     new_ad = Ad.query.get_or_404(ad_id)
#     if request.method == 'PUT':  
#         request_data = request.get_json()     
#         if("description" in request_data):
#             new_ad.description = request_data['description']
#         if("rent" in request_data):
#             new_ad.rent = request_data['rent']
#         if("start_date" in request_data):
#             new_ad.start_date = request_data['start_date']
#         if("end_date" in request_data):
#             new_ad.end_date = request_data['end_date']
#         if("paid" in request_data):
#             new_ad.paid = request_data['paid']    
#         db.session.commit()
#         return jsonify(new_ad.serialize())

#     elif request.method == 'DELETE':
#         db.session.delete(new_ad)
#         db.session.commit()
#         return "ok"

#     abort(404)        

#Used to get, edit and delete specific review
@app.route('/reviews/<int:review_id>', methods=['GET', 'PUT', 'DELETE'])    
@jwt_required()
def specific_review(review_id):
    new_review = Review.query.get_or_404(review_id)

    if request.method == 'GET':
        return jsonify(new_review.serialize())

    elif request.method == 'PUT':            
        request_data = request.get_json()     
        if("rating" in request_data):
            new_review.rating = request_data['rating']
        if("text" in request_data):
            new_review.text = request_data['text']
        if("user" in request_data):
            new_review.user = User.query.get_or_404(request_data['user'])

        db.session.commit()
        return jsonify(new_review.serialize())

    elif request.method == 'DELETE':
        db.session.delete(new_review)
        db.session.commit()
        return "ok"

    abort(404)

#Gets all ads uploaded by specific user
@app.route('/users/<int:user_id>/ads', methods=['GET'])
@jwt_required()
def show_ads(user_id):
   
    ad_list = []
    new_user = User.query.get_or_404(user_id)

    for apartment in new_user.apartments: 
        ad = Ad.query.filter_by(apartment_id = apartment.id).first()  # Not so smooth to get ads via apartments, will be solved by putting ads and apartments together in database
        if (ad.paid):
            ad_list.append(ad.serialize())
    return jsonify(ad_list)

    abort(404)

#Gets all apartments for a user?
@app.route('/users/<int:user_id>/apartments', methods=['GET'])
@jwt_required()
def show_apartments(user_id):
   
    apartment_list = []
    new_user = User.query.get_or_404(user_id)

    for apartment in new_user.apartments:
        ad = Ad.query.filter_by(apartment_id = apartment.id).first() 
        if (ad.paid):
            apartment_list.append(apartment.serialize())
    return jsonify(apartment_list)

    abort(404)


#Gets all reviews of specific user
@app.route('/users/<int:user_id>/reviews', methods=['GET'])
def show_reviews(user_id):
   
    review_list = []
    new_user = User.query.get_or_404(user_id)

    for review in new_user.reviews:
        review_list.append(dict(id=review.id, rating=review.rating, text=review.text, date=review.date))
    return jsonify(review_list)

    abort(404)

@app.route('/edit-bio', methods=['PUT'])
@jwt_required()
def edit_bio():
    print("editbio")
    if request.method == 'PUT':
        print("editbio")
        request_data = request.get_json()
        user = User.query.get_or_404(request_data['id'])
        user.first_name = request_data['first_name']
        user.last_name = request_data['last_name']
        user.bio = request_data['bio']
        user.occupation = request_data['occupation']

        db.session.commit()

        return jsonify(user.serialize())               

#Adds newly registered users to database
@app.route('/sign-up', methods=['POST'])
def sign_up():
     if request.method == 'POST':
        request_data = request.get_json()
        customer = stripe.Customer.create(
            name = request_data['first_name'] + ' ' + request_data['last_name'],
            email = request_data['email']
        )
        new_user = User(email = request_data['email'], first_name = request_data['first_name'], last_name = request_data['last_name'], bio = request_data['bio'], occupation = request_data['occupation'], customer_id = customer.id, is_student = request_data['is_student'])
        
        new_user.set_password(request_data['password'])

        db.session.add(new_user)
        db.session.commit()

        return 'OK'    

#Handles login process, gives user an access_token when logged in
@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        request_data = request.get_json()

        if(User.query.filter_by(email = request_data['email']).first()):
            user = User.query.filter_by(email = request_data['email']).first() 
        else:
            abort(401)
        
        if(bcrypt.check_password_hash(user.password_hash, request_data['password'])):
            access_token = create_access_token(identity = user.id, fresh=False, expires_delta=None)
            return jsonify(token = access_token, user = user.serialize())

    abort(401)     

#Handles login process för admins
@app.route('/admin', methods=['POST'])
def admin_login():
    if request.method == 'POST':
        request_data = request.get_json()
        admin = Admin.query.filter_by(username = request_data['username']).first()
        if not admin:
            return abort(401)
        
        if(bcrypt.check_password_hash(admin.password_hash, request_data['password'])):
            access_token = create_access_token(identity = admin.id, fresh=False, expires_delta=None)
            return jsonify(admin_token = access_token, admin = admin.serialize())

    abort(401)    
    
#Payment for specific user          
@app.route('/secret/<int:user_id>', methods= ['POST'])
def secret(user_id):
    user = User.query.get_or_404(user_id)
    customer_id = user.customer_id
    if request.method == 'POST':
        if user.is_student:
            intent = stripe.PaymentIntent.create(
            amount=9900,
            currency='sek',
            customer=stripe.Customer.retrieve(customer_id),
            metadata={'integration_check': 'accept_a_payment'},
        )
        else:
            intent = stripe.PaymentIntent.create(
            amount=14900,
            currency='sek',
            customer=stripe.Customer.retrieve(customer_id),
            metadata={'integration_check': 'accept_a_payment'},
        )
           
        return jsonify(client_secret=intent.client_secret)

    abort(401)

#Payment history for specific user      
@app.route('/payment-history/<string:customer_id>', methods= ['GET'])
@jwt_required()
def payment_history(customer_id):
    payment_history_list = []
    history = stripe.PaymentIntent.list(customer=customer_id, limit=100)

    for element in history.data:
        if element.status == 'succeeded':
            date = datetime.fromtimestamp(int(element.created)).strftime('%Y-%m-%d')
            payment_history_list.append(dict(amount=int(element.amount/100), date=date))
    return jsonify(payment_history_list)


@socketio.on('message', namespace='/chat')
def handleMessage(data):
    print('Message: ' + data['message'])
    send(data['message'], room = data['room'])

@socketio.on('join', namespace='/chat')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    if room==0:   
        send('Välkommen till Subbos chattlobby, du kan start en konversation genom ' 
        + 'att klicka på knappen till vänster! Du kan även skriva här nedan för att nå ALLA användare', to=room)
        return
    send(username + ' har joinat chatten. ', to=room)

@socketio.on('leave', namespace='/chat')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)

@socketio.on('newchat', namespace='/chat')
def handle_newchat(id, firstname, lastname):
    emit('receivenewchat', (id, firstname, lastname), broadcast=True)



if __name__ == "__main__":
    socketio.run(app, debug=True)