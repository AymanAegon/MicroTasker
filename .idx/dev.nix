# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
{pkgs}: {
  # Which nixpkgs channel to use.
  channel = "stable-24.11"; # or "unstable"
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
  ];
  # Sets environment variables in the workspace
  env = {
        NEXT_PUBLIC_FIREBASE_API_KEY = "AIzaSyAVWvf_soA85wi4pn9ixwnrBI9cYFroNeU";
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="errandease-kle14.firebaseapp.com";
        NEXT_PUBLIC_FIREBASE_PROJECT_ID="errandease-kle14";
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="errandease-kle14.firebasestorage.app";
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="558564995227";
        NEXT_PUBLIC_FIREBASE_APP_ID="1:558564995227:web:d04267bb4d4553eaa3563e";};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
    ];
    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };
}
