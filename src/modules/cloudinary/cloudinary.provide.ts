import { v2 } from 'cloudinary';
import { CLOUDINARY } from 'src/constants';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: () => {
    return v2.config({
      cloud_name: 'dstvymie8',
      api_key: '961994623446683',
      api_secret: 'EZEbhpt-zjZccTFb-4geknFIXTQ',
    });
  },
};
