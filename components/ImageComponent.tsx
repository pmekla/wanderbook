import React from "react";
import { View } from "react-native";
import { AdvancedImage } from "@cloudinary/react";
import { cld } from "../cloudinaryConfig";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";

interface Props {
  publicId: string;
  width?: number;
  height?: number;
}

const ImageComponent = ({ publicId, width = 500, height = 500 }: Props) => {
  const img = cld
    .image(publicId)
    .format("auto")
    .quality("auto")
    .resize(auto().gravity(autoGravity()).width(width).height(height));

  return (
    <View>
      <AdvancedImage cldImg={img} />
    </View>
  );
};

export default ImageComponent;
