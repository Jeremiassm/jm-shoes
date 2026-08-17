import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Error inesperado" };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-black min-h-screen text-white flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-600/20 flex items-center justify-center mb-6">
              <span className="text-red-500 text-2xl font-bold" aria-hidden="true">!</span>
            </div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
              Algo salio mal
            </h1>
            <p className="text-zinc-400 mt-4">
              Ocurrio un error inesperado al cargar la pagina. Proba recargar y, si el
              problema sigue, avisanos.
            </p>
            {this.state.message && (
              <p className="text-zinc-600 text-xs mt-4 break-all" role="alert">
                {this.state.message}
              </p>
            )}
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <button
                type="button"
                onClick={this.handleReload}
                className="bg-red-600 hover:bg-red-700 transition px-6 py-3 rounded-full font-semibold uppercase tracking-widest text-sm"
              >
                Recargar
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="border border-white/20 hover:border-white/60 hover:bg-white/5 transition px-6 py-3 rounded-full font-semibold uppercase tracking-widest text-sm"
              >
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
